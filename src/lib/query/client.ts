import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && [400, 401, 403, 404, 409, 422].includes(error.status)) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

let browserClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  if (!browserClient) browserClient = createQueryClient();
  return browserClient;
}

export const queryKeys = {
  me: ["me"] as const,
  crops: (params?: unknown) => ["crops", params] as const,
  markets: (params?: unknown) => ["markets", params] as const,
  listings: (params?: unknown) => ["listings", params] as const,
  listing: (id: string) => ["listing", id] as const,
  myListings: (params?: unknown) => ["my-listings", params] as const,
  offersReceived: (params?: unknown) => ["offers-received", params] as const,
  offersMine: (params?: unknown) => ["offers-mine", params] as const,
  orders: (params?: unknown) => ["orders", params] as const,
  order: (id: string) => ["order", id] as const,
  requirements: (params?: unknown) => ["requirements", params] as const,
  prices: (params?: unknown) => ["prices", params] as const,
  notifications: (params?: unknown) => ["notifications", params] as const,
  conversations: ["conversations"] as const,
  messages: (id: string) => ["messages", id] as const,
  matches: ["matches"] as const,
  farmerProfile: ["farmer-profile"] as const,
  buyerProfile: ["buyer-profile"] as const,
  transporterProfile: ["transporter-profile"] as const,
  deliveries: (params?: unknown) => ["deliveries", params] as const,
  delivery: (id: string) => ["delivery", id] as const,
  admin: (resource: string, params?: unknown) => ["admin", resource, params] as const,
  fpos: (params?: unknown) => ["fpos", params] as const,
  disputes: (params?: unknown) => ["disputes", params] as const,
};
