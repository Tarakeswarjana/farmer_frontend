import { sendData } from "@/lib/api/client";
import type { Review } from "@/types/api";

export const reviewsApi = {
  create(body: { orderId: string; rating: number; comment?: string }) {
    return sendData<Review>("post", "/reviews", body);
  },
};
