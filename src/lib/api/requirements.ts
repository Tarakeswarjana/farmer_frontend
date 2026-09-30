import { getData, getPage, sendData } from "@/lib/api/client";
import type { GeoInput, PageQuery, QualityGrade, Requirement, Unit } from "@/types/api";

export interface RequirementInput {
  cropId: string;
  quantity: number;
  unit: Unit;
  targetPrice: number;
  qualityGrade?: QualityGrade;
  requiredDate: string;
  marketId?: string;
  district?: string;
  state?: string;
  location?: GeoInput;
  notes?: string;
  expiresAt?: string;
}

export const requirementsApi = {
  create(body: RequirementInput) {
    return sendData<Requirement>("post", "/requirements", body);
  },
  list(params?: PageQuery & { cropId?: string; marketId?: string; district?: string; mine?: boolean }, signal?: AbortSignal) {
    return getPage<Requirement>("/requirements", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Requirement>(`/requirements/${id}`, undefined, signal);
  },
  update(id: string, body: Partial<RequirementInput>) {
    return sendData<Requirement>("patch", `/requirements/${id}`, body);
  },
  remove(id: string) {
    return sendData<Requirement>("delete", `/requirements/${id}`);
  },
};
