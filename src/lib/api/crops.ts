import { getData, getPage, sendData } from "@/lib/api/client";
import type { Crop, PageQuery, Unit } from "@/types/api";

export interface CropInput {
  name: string;
  localNames?: string[];
  bengaliName?: string;
  category: "VEGETABLE" | "LEAFY" | "ROOT" | "GOURD" | "SPICE";
  unit?: Unit;
  image?: string;
  description?: string;
  season: "RABI" | "KHARIF" | "ZAID" | "YEAR_ROUND";
}

export const cropsApi = {
  create(body: CropInput) {
    return sendData<Crop>("post", "/crops", body);
  },
  list(params?: PageQuery & { category?: string }, signal?: AbortSignal) {
    return getPage<Crop>("/crops", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Crop>(`/crops/${id}`, undefined, signal);
  },
  update(id: string, body: Partial<CropInput>) {
    return sendData<Crop>("patch", `/crops/${id}`, body);
  },
};
