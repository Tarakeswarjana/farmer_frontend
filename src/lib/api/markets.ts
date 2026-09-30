import { getData, getPage, sendData } from "@/lib/api/client";
import type { GeoInput, Market, MarketPrice, MarketType, PageQuery } from "@/types/api";

export interface MarketInput {
  name: string;
  marketCode: string;
  marketType: MarketType;
  address: string;
  village?: string;
  block?: string;
  district: string;
  state?: string;
  pincode?: string;
  location: GeoInput;
  operatingDays?: string[];
  openingTime?: string;
  closingTime?: string;
  commodities?: string[];
  commissionRate?: number;
}

export const marketsApi = {
  create(body: MarketInput) {
    return sendData<Market>("post", "/markets", body);
  },
  list(params?: PageQuery & { district?: string; marketType?: string }, signal?: AbortSignal) {
    return getPage<Market>("/markets", params, signal);
  },
  nearby(params: PageQuery & { lat: number; lng: number; radius?: number }, signal?: AbortSignal) {
    return getPage<Market>("/markets/nearby", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Market>(`/markets/${id}`, undefined, signal);
  },
  update(id: string, body: Partial<MarketInput>) {
    return sendData<Market>("patch", `/markets/${id}`, body);
  },
  prices(id: string, params?: PageQuery & { cropId?: string; from?: string; to?: string }, signal?: AbortSignal) {
    return getPage<MarketPrice>(`/markets/${id}/prices`, params, signal);
  },
};
