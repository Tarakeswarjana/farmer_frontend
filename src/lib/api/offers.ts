import { getPage, sendData } from "@/lib/api/client";
import type { Offer, Order, PageQuery } from "@/types/api";

export const offersApi = {
  mine(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Offer>("/offers/my", params, signal);
  },
  received(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Offer>("/offers/received", params, signal);
  },
  accept(id: string) {
    return sendData<Order>("patch", `/offers/${id}/accept`);
  },
  reject(id: string) {
    return sendData<Offer>("patch", `/offers/${id}/reject`);
  },
  counter(id: string, body: { offeredPrice: number; quantity: number; message?: string }) {
    return sendData<Offer>("patch", `/offers/${id}/counter`, body);
  },
  cancel(id: string) {
    return sendData<Offer>("patch", `/offers/${id}/cancel`);
  },
};
