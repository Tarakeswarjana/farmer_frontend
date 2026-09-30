import axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { ApiError, toApiError } from "@/lib/api/errors";
import { tokenStore } from "@/lib/auth/token-store";
import { reportError } from "@/lib/monitoring/errors";
import type { ApiFailureBody, AuthSession, Page } from "@/types/api";

export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export function apiOrigin() {
  return apiBaseUrl().replace(/\/api\/v1$/, "");
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Page<T>["meta"] | null;
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 30_000,
  headers: { Accept: "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;
  if (!refreshPromise) {
    refreshPromise = axios
      .post<Envelope<AuthSession>>(`${apiBaseUrl()}/auth/refresh-token`, { refreshToken }, { timeout: 20_000 })
      .then((response) => {
        const data = response.data.data;
        tokenStore.setSession(data);
        return data.accessToken;
      })
      .catch((error: unknown) => {
        reportError(error, { area: "refresh" });
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailureBody>) => {
    const config = error.config as RetryConfig | undefined;
    const url = config?.url ?? "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/refresh-token") || url.includes("/auth/register");
    if (config && error.response?.status === 401 && !config._retry && !isAuthCall) {
      config._retry = true;
      const next = await refreshAccessToken();
      if (!next) {
        tokenStore.clear();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
          const nextPath = `${window.location.pathname}${window.location.search}`;
          window.location.assign(`/auth/login?reason=session&next=${encodeURIComponent(nextPath)}`);
        }
        throw toApiError(error);
      }
      config.headers.Authorization = `Bearer ${next}`;
      return api.request(config);
    }
    const apiError = toApiError(error);
    if (apiError.status >= 500 || apiError.status === 0) reportError(apiError, { url });
    throw apiError;
  },
);

export function cleanParams(params?: object) {
  if (!params) return undefined;
  const entries = Object.entries(params as Record<string, unknown>).filter(([, value]) => value !== undefined && value !== "" && value !== null);
  return Object.fromEntries(entries);
}

export async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw toApiError(error);
  }
}

export async function unwrapPage<T>(promise: Promise<{ data: Envelope<T[]> }>): Promise<Page<T>> {
  try {
    const response = await promise;
    const meta = response.data.meta ?? { page: 1, limit: response.data.data.length, total: response.data.data.length, totalPages: 1 };
    return { items: response.data.data ?? [], meta };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw toApiError(error);
  }
}

export function getData<T>(url: string, params?: object, signal?: AbortSignal) {
  return unwrap<T>(api.get(url, { params: cleanParams(params), signal }));
}

export function getPage<T>(url: string, params?: object, signal?: AbortSignal) {
  return unwrapPage<T>(api.get(url, { params: cleanParams(params), signal }));
}

export function sendData<T>(method: "post" | "patch" | "delete", url: string, body?: unknown, config?: AxiosRequestConfig) {
  return unwrap<T>(api.request({ method, url, data: body, ...config }));
}

export function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
