import { getData, getPage, sendData } from "@/lib/api/client";
import type { FarmerProfile, GeoInput, Listing, ListingQuery, PageQuery } from "@/types/api";

export interface FarmerProfileInput {
  farmerName: string;
  farmName?: string;
  fatherName?: string;
  phone: string;
  address: string;
  village?: string;
  gramPanchayat?: string;
  block?: string;
  district: string;
  state?: string;
  pincode: string;
  location: GeoInput;
  farmSize?: number;
  farmSizeUnit?: "ACRE" | "BIGHA" | "HECTARE" | "DECIMAL";
  primaryCrops?: string[];
  farmingType?: "ORGANIC" | "CONVENTIONAL" | "MIXED" | "NATURAL";
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
    branch?: string;
  };
}

export const farmersApi = {
  createProfile(body: FarmerProfileInput) {
    return sendData<FarmerProfile>("post", "/farmers/profile", body);
  },
  myProfile(signal?: AbortSignal) {
    return getData<FarmerProfile>("/farmers/profile", undefined, signal);
  },
  updateProfile(body: Partial<FarmerProfileInput>) {
    return sendData<FarmerProfile>("patch", "/farmers/profile", body);
  },
  nearby(params: PageQuery & { lat: number; lng: number; radius?: number }, signal?: AbortSignal) {
    return getPage<FarmerProfile>("/farmers/nearby", params, signal);
  },
  myListings(params?: ListingQuery, signal?: AbortSignal) {
    return getPage<Listing>("/farmers/me/listings", params, signal);
  },
  get(farmerId: string, signal?: AbortSignal) {
    return getData<FarmerProfile>(`/farmers/${farmerId}`, undefined, signal);
  },
};
