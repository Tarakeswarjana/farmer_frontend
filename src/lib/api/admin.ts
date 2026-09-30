import { getData, getPage, sendData } from "@/lib/api/client";
import type {
  AdminDashboard,
  AuditLog,
  BuyerProfile,
  Dispute,
  FarmerProfile,
  Fpo,
  Listing,
  Market,
  Order,
  PageQuery,
  Payment,
  Role,
  User,
  VerificationStatus,
} from "@/types/api";

export interface AdminQuery extends PageQuery {
  role?: string;
  district?: string;
  verificationStatus?: string;
  businessType?: string;
  action?: string;
  entity?: string;
}

export const adminApi = {
  dashboard(signal?: AbortSignal) {
    return getData<AdminDashboard>("/admin/dashboard", undefined, signal);
  },
  users(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<User>("/admin/users", params, signal);
  },
  farmers(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<FarmerProfile>("/admin/farmers", params, signal);
  },
  buyers(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<BuyerProfile>("/admin/buyers", params, signal);
  },
  fpos(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Fpo>("/admin/fpos", params, signal);
  },
  listings(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Listing>("/admin/listings", params, signal);
  },
  orders(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Order>("/admin/orders", params, signal);
  },
  payments(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Payment>("/admin/payments", params, signal);
  },
  markets(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Market>("/admin/markets", params, signal);
  },
  disputes(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<Dispute>("/admin/disputes", params, signal);
  },
  auditLogs(params?: AdminQuery, signal?: AbortSignal) {
    return getPage<AuditLog>("/admin/audit-logs", params, signal);
  },
  verifyFarmer(id: string, status: VerificationStatus) {
    return sendData<FarmerProfile>("patch", `/admin/farmers/${id}/verification`, { status });
  },
  verifyBuyer(id: string, status: VerificationStatus) {
    return sendData<BuyerProfile>("patch", `/admin/buyers/${id}/verification`, { status });
  },
  verifyFpo(id: string, status: VerificationStatus) {
    return sendData<Fpo>("patch", `/admin/fpos/${id}/verification`, { status });
  },
  verifyTransporter(id: string, status: VerificationStatus) {
    return sendData<{ isVerified: boolean }>("patch", `/admin/transporters/${id}/verification`, { status });
  },
  blockUser(id: string, isBlocked: boolean) {
    return sendData<User>("patch", `/admin/users/${id}/block`, { isBlocked });
  },
  setRoles(id: string, roles: Role[]) {
    return sendData<User>("patch", `/admin/users/${id}/roles`, { roles });
  },
};
