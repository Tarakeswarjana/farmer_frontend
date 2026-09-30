import { getPage, sendData } from "@/lib/api/client";
import type { MarketPrice, PageQuery, Unit } from "@/types/api";

export const marketPricesApi = {
  create(body: {
    cropId: string;
    marketId: string;
    date: string;
    minimumPrice: number;
    maximumPrice: number;
    modalPrice: number;
    unit?: Unit;
    source?: "MANUAL" | "INTERNAL_ORDERS" | "AGMARKNET";
  }) {
    return sendData<MarketPrice>("post", "/market-prices", body);
  },
  list(params?: PageQuery & { cropId?: string; marketId?: string; from?: string; to?: string }, signal?: AbortSignal) {
    return getPage<MarketPrice>("/market-prices", params, signal);
  },
  byCrop(cropId: string, params?: PageQuery & { marketId?: string; from?: string; to?: string }, signal?: AbortSignal) {
    return getPage<MarketPrice>(`/market-prices/${cropId}`, params, signal);
  },
};
