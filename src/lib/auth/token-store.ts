import type { User } from "@/types/api";

/**
 * Token assumption
 * ----------------
 * The backend returns `accessToken` and `refreshToken` in the JSON body.
 * It does not set httpOnly cookies. This module is the only place that
 * touches those tokens.
 *
 * - Access and refresh tokens live in memory, and in sessionStorage so a
 *   reload in the same tab can rotate them. They are never written to
 *   localStorage and never logged.
 * - A non-secret `vm_role` cookie is set so Next.js middleware can route
 *   before JavaScript hydrates. The API still rejects a missing or expired
 *   JWT, so a forged role cookie cannot read or change data.
 */

const STORAGE_KEY = "vm.session.v1";

interface PersistedTokens {
  accessToken: string;
  refreshToken: string;
}

type Listener = (user: User | null) => void;

let memory: PersistedTokens | null = null;
let currentUser: User | null = null;
const listeners = new Set<Listener>();

function canUseBrowser() {
  return typeof window !== "undefined";
}

function readPersisted(): PersistedTokens | null {
  if (!canUseBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedTokens;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeRoleCookie(role: string | null) {
  if (!canUseBrowser()) return;
  if (!role) {
    document.cookie = "vm_role=; Path=/; Max-Age=0; SameSite=Lax";
    document.cookie = "vm_auth=; Path=/; Max-Age=0; SameSite=Lax";
    return;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `vm_role=${encodeURIComponent(role)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
  document.cookie = `vm_auth=1; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

function notify() {
  listeners.forEach((listener) => listener(currentUser));
}

export const tokenStore = {
  getAccessToken(): string | null {
    return memory?.accessToken ?? readPersisted()?.accessToken ?? null;
  },
  getRefreshToken(): string | null {
    return memory?.refreshToken ?? readPersisted()?.refreshToken ?? null;
  },
  getUser(): User | null {
    return currentUser;
  },
  setSession(input: { accessToken: string; refreshToken: string; user: User }) {
    memory = { accessToken: input.accessToken, refreshToken: input.refreshToken };
    currentUser = input.user;
    if (canUseBrowser()) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    }
    writeRoleCookie(input.user.role);
    notify();
  },
  setUser(user: User) {
    currentUser = user;
    writeRoleCookie(user.role);
    notify();
  },
  clear() {
    memory = null;
    currentUser = null;
    if (canUseBrowser()) window.sessionStorage.removeItem(STORAGE_KEY);
    writeRoleCookie(null);
    notify();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hasPersistedSession() {
    return Boolean(readPersisted()?.refreshToken);
  },
};
