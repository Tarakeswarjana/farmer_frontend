import type { ApiFailureBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Array<{ path?: string; message: string }>;

  constructor(input: { status: number; code: string; message: string; details?: Array<{ path?: string; message: string }> }) {
    super(input.message);
    this.name = "ApiError";
    this.status = input.status;
    this.code = input.code;
    this.details = input.details ?? [];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function messageForStatus(status: number, fallback: string): string {
  if (status === 0) return "Internet connection required to complete this action.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "We could not find that record.";
  if (status === 409) return fallback || "This item has already changed. Refresh and try again.";
  if (status === 422 || status === 400) return fallback || "Please correct the highlighted fields.";
  if (status >= 500) return "Something went wrong. Please try again.";
  return fallback || "Something went wrong. Please try again.";
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const axiosLike = error as {
    response?: { status?: number; data?: ApiFailureBody };
    message?: string;
    code?: string;
  };
  if (axiosLike?.code === "ERR_CANCELED") {
    return new ApiError({ status: 499, code: "CANCELLED", message: "Request cancelled" });
  }
  if (!axiosLike?.response) {
    return new ApiError({
      status: 0,
      code: "NETWORK",
      message: "Internet connection required to complete this action.",
    });
  }
  const status = axiosLike.response.status ?? 500;
  const body = axiosLike.response.data;
  const backendMessage = body?.message;
  const safeMessage =
    status >= 500 ? messageForStatus(status, "") : messageForStatus(status, backendMessage || "");
  return new ApiError({
    status,
    code: body?.error?.code || "REQUEST_FAILED",
    message: safeMessage,
    details: body?.error?.details ?? [],
  });
}
