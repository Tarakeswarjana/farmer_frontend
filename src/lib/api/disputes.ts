import { getData, getPage, sendData } from "@/lib/api/client";
import type { Dispute, DisputeStatus, PageQuery } from "@/types/api";

export const disputesApi = {
  create(body: { orderId: string; reason: string; description: string; images?: string[] }) {
    return sendData<Dispute>("post", "/disputes", body);
  },
  list(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Dispute>("/disputes", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Dispute>(`/disputes/${id}`, undefined, signal);
  },
  resolve(id: string, body: { status: Extract<DisputeStatus, "UNDER_REVIEW" | "RESOLVED" | "REJECTED">; resolution?: string }) {
    return sendData<Dispute>("patch", `/disputes/${id}/resolve`, body);
  },
};
