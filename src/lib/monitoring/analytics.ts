export type AnalyticsEvent =
  | "USER_REGISTERED"
  | "LISTING_CREATED"
  | "LISTING_VIEWED"
  | "OFFER_CREATED"
  | "OFFER_ACCEPTED"
  | "ORDER_CREATED"
  | "PAYMENT_STARTED"
  | "PAYMENT_COMPLETED"
  | "DELIVERY_COMPLETED";

export interface AnalyticsClient {
  track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void;
}

const client: AnalyticsClient = {
  track(event, properties) {
    if (process.env.NODE_ENV === "production") return;
    console.info("[analytics]", event, properties ?? {});
  },
};

export const analytics = client;
