import { getData, idempotencyKey, sendData } from "@/lib/api/client";
import type { Payment, PaymentCreateResult, PaymentMethod } from "@/types/api";

export const paymentsApi = {
  create(body: { orderId: string; amount?: number; method: PaymentMethod; provider?: "CASH" | "MANUAL" | "RAZORPAY" | "MOCK"; idempotencyKey?: string }) {
    const key = body.idempotencyKey || idempotencyKey();
    return sendData<PaymentCreateResult>("post", "/payments/create", { ...body, idempotencyKey: key }, { headers: { "Idempotency-Key": key } });
  },
  verify(body: { paymentId: string; providerPaymentId?: string; signature?: string }) {
    return sendData<Payment>("post", "/payments/verify", body);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Payment>(`/payments/${id}`, undefined, signal);
  },
  refund(id: string, body?: { amount?: number; reason?: string }) {
    return sendData<Payment>("post", `/payments/${id}/refund`, body ?? {});
  },
};
