import { getData, getPage, idempotencyKey, sendData } from "@/lib/api/client";
import type { Order, OrderStatus, PageQuery } from "@/types/api";

export interface OrderInput {
  listingId: string;
  quantity: number;
  deliveryLocation?: { address: string; landmark?: string; longitude?: number; latitude?: number };
  transportCharge?: number;
  discount?: number;
  scheduledPickupDate?: string;
  scheduledDeliveryDate?: string;
  notes?: string;
  idempotencyKey?: string;
}

export const ordersApi = {
  create(body: OrderInput) {
    const key = body.idempotencyKey || idempotencyKey();
    return sendData<Order>("post", "/orders", { ...body, idempotencyKey: key }, { headers: { "Idempotency-Key": key } });
  },
  list(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Order>("/orders", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Order>(`/orders/${id}`, undefined, signal);
  },
  updateStatus(id: string, status: OrderStatus) {
    return sendData<Order>("patch", `/orders/${id}/status`, { status });
  },
  cancel(id: string) {
    return sendData<Order>("post", `/orders/${id}/cancel`);
  },
  confirm(id: string) {
    return sendData<Order>("post", `/orders/${id}/confirm`);
  },
  complete(id: string) {
    return sendData<Order>("post", `/orders/${id}/complete`);
  },
};
