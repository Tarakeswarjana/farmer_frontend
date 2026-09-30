import { getData, getPage, sendData } from "@/lib/api/client";
import type { BuyerProfile, BusinessType, GeoInput, PageQuery } from "@/types/api";

export interface BuyerProfileInput {
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  address: string;
  village?: string;
  block?: string;
  district: string;
  state?: string;
  pincode?: string;
  markets?: string[];
  preferredCrops?: string[];
  buyingCapacity?: number;
  paymentTerms?: string;
  location: GeoInput;
}

export const buyersApi = {
  createProfile(body: BuyerProfileInput) {
    return sendData<BuyerProfile>("post", "/buyers/profile", body);
  },
  myProfile(signal?: AbortSignal) {
    return getData<BuyerProfile>("/buyers/profile", undefined, signal);
  },
  updateProfile(body: Partial<BuyerProfileInput>) {
    return sendData<BuyerProfile>("patch", "/buyers/profile", body);
  },
  nearby(params: PageQuery & { lat: number; lng: number; radius?: number }, signal?: AbortSignal) {
    return getPage<BuyerProfile>("/buyers/nearby", params, signal);
  },
  get(buyerId: string, signal?: AbortSignal) {
    return getData<BuyerProfile>(`/buyers/${buyerId}`, undefined, signal);
  },
};
