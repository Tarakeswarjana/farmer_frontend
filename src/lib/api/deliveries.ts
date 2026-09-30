import { getData, getPage, sendData } from "@/lib/api/client";
import type { Delivery, DeliveryStatus, GeoInput, PageQuery, TransporterProfile, VehicleType } from "@/types/api";

export interface TransporterInput {
  businessName: string;
  phone: string;
  vehicleTypes: VehicleType[];
  vehicles: Array<{
    vehicleNumber: string;
    vehicleType: VehicleType;
    capacity: number;
    driverName: string;
    driverPhone: string;
  }>;
  serviceAreas: Array<{ district: string; state?: string }>;
  location: GeoInput;
}

export const deliveriesApi = {
  create(body: {
    orderId: string;
    pickupAddress?: string;
    dropAddress: string;
    dropLongitude?: number;
    dropLatitude?: number;
    scheduledPickup?: string;
    scheduledDelivery?: string;
    estimatedCost?: number;
  }) {
    return sendData<Delivery>("post", "/deliveries", body);
  },
  available(params?: PageQuery, signal?: AbortSignal) {
    return getPage<Delivery>("/deliveries/available", params, signal);
  },
  get(id: string, signal?: AbortSignal) {
    return getData<Delivery>(`/deliveries/${id}`, undefined, signal);
  },
  updateStatus(id: string, body: { status: DeliveryStatus; note?: string }) {
    return sendData<Delivery>("patch", `/deliveries/${id}/status`, body);
  },
  assign(id: string, body: { transporterId: string; vehicleId: string }) {
    return sendData<Delivery>("post", `/deliveries/${id}/assign`, body);
  },
  createProfile(body: TransporterInput) {
    return sendData<TransporterProfile>("post", "/transporters/profile", body);
  },
  myProfile(signal?: AbortSignal) {
    return getData<TransporterProfile>("/transporters/profile", undefined, signal);
  },
  updateProfile(body: Partial<TransporterInput>) {
    return sendData<TransporterProfile>("patch", "/transporters/profile", body);
  },
};
