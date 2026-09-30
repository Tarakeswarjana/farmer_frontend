import { getData, getPage, sendData } from "@/lib/api/client";
import type { FarmerProfile, Fpo, GeoInput, PageQuery } from "@/types/api";

export interface FpoInput {
  name: string;
  registrationNumber: string;
  description?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  village?: string;
  block?: string;
  district: string;
  state?: string;
  pincode?: string;
  location: GeoInput;
  primaryCrops?: string[];
}

export const fposApi = {
  create(body: FpoInput) {
    return sendData<Fpo>("post", "/fpos", body);
  },
  list(params?: PageQuery & { district?: string }, signal?: AbortSignal) {
    return getPage<Fpo>("/fpos", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Fpo>(`/fpos/${id}`, undefined, signal);
  },
  update(id: string, body: Partial<FpoInput>) {
    return sendData<Fpo>("patch", `/fpos/${id}`, body);
  },
  addMember(id: string, farmerId: string) {
    return sendData<Fpo>("post", `/fpos/${id}/members`, { farmerId });
  },
  members(id: string, params?: PageQuery, signal?: AbortSignal) {
    return getPage<FarmerProfile>(`/fpos/${id}/members`, params, signal);
  },
  removeMember(id: string, farmerId: string) {
    return sendData<Fpo>("delete", `/fpos/${id}/members/${farmerId}`);
  },
};
