import { getPage, sendData } from "@/lib/api/client";
import type { AppNotification, PageQuery } from "@/types/api";

export const notificationsApi = {
  list(params?: PageQuery & { channel?: string; isRead?: boolean }, signal?: AbortSignal) {
    return getPage<AppNotification>("/notifications", params, signal);
  },
  markRead(id: string) {
    return sendData<AppNotification>("patch", `/notifications/${id}/read`);
  },
  markAllRead() {
    return sendData<{ updated: number }>("patch", "/notifications/read-all");
  },
};
