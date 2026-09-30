import { getData, sendData } from "@/lib/api/client";
import type { AuthSession, User } from "@/types/api";

export const authApi = {
  register(body: { name: string; phone: string; email?: string; password: string; role: string }) {
    return sendData<{ user: User; debugCode?: string }>("post", "/auth/register", body);
  },
  login(body: { identifier: string; password: string }) {
    return sendData<AuthSession>("post", "/auth/login", body);
  },
  refresh(refreshToken: string) {
    return sendData<AuthSession>("post", "/auth/refresh-token", { refreshToken });
  },
  logout(refreshToken: string) {
    return sendData<{ loggedOut: boolean }>("post", "/auth/logout", { refreshToken });
  },
  forgotPassword(identifier: string) {
    return sendData<{ message: string; debugCode?: string }>("post", "/auth/forgot-password", { identifier });
  },
  resetPassword(body: { identifier: string; code: string; newPassword: string }) {
    return sendData<{ reset: boolean }>("post", "/auth/reset-password", body);
  },
  verifyPhone(body: { phone: string; code: string }) {
    return sendData<User>("post", "/auth/verify-phone", body);
  },
  verifyEmail(body: { email: string; code: string }) {
    return sendData<User>("post", "/auth/verify-email", body);
  },
  me(signal?: AbortSignal) {
    return getData<User>("/users/me", undefined, signal);
  },
};
