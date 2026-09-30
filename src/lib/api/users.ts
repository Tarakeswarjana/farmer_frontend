import { getData, getPage, sendData } from "@/lib/api/client";
import type { GeoInput, PageQuery, Review, User } from "@/types/api";

export const usersApi = {
  me(signal?: AbortSignal) {
    return getData<User>("/users/me", undefined, signal);
  },
  updateMe(body: { name?: string; email?: string; profileImage?: string }) {
    return sendData<User>("patch", "/users/me", body);
  },
  updateLocation(
    body: GeoInput & { address?: string; village?: string; district?: string; state?: string; pincode?: string },
  ) {
    return sendData<User>("patch", "/users/me/location", body);
  },
  changePassword(body: { currentPassword: string; newPassword: string }) {
    return sendData<{ changed: boolean }>("patch", "/users/me/change-password", body);
  },
  reviews(userId: string, params?: PageQuery, signal?: AbortSignal) {
    return getPage<Review>(`/users/${userId}/reviews`, params, signal);
  },
};
