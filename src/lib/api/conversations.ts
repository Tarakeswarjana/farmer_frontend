import { getPage, sendData } from "@/lib/api/client";
import type { ChatMessage, Conversation, PageQuery } from "@/types/api";

export const conversationsApi = {
  create(body: { participantId: string; listingId?: string; orderId?: string }) {
    return sendData<Conversation>("post", "/conversations", body);
  },
  list(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Conversation>("/conversations", params, signal);
  },
  messages(id: string, params?: PageQuery, signal?: AbortSignal) {
    return getPage<ChatMessage>(`/conversations/${id}/messages`, params, signal);
  },
  send(id: string, body: { message: string; messageType?: "TEXT" | "IMAGE" | "SYSTEM"; attachments?: string[] }) {
    return sendData<ChatMessage>("post", `/conversations/${id}/messages`, body);
  },
  markMessageRead(id: string) {
    return sendData<ChatMessage>("patch", `/messages/${id}/read`);
  },
};
