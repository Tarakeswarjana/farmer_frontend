import type { Listing, Requirement } from "@/types/api";
import { coordsOf, haversineKm } from "@/lib/utils/format";

export interface MatchCheck {
  key: "sameCrop" | "quantity" | "price" | "nearby";
  ok: boolean;
}

/**
 * Human-readable checks from fields the API already returned.
 * This is not the backend ranking score. The matching endpoint does not
 * expose its internal weights.
 */
export function explainSupplyMatch(requirement: Requirement, listing: Listing, origin?: { lat: number; lng: number } | null): MatchCheck[] {
  const listingPoint = coordsOf(listing.location);
  const requirementPoint = coordsOf(requirement.location) ?? origin ?? null;
  const checks: MatchCheck[] = [
    { key: "sameCrop", ok: requirement.cropId === listing.cropId },
    { key: "quantity", ok: listing.availableQuantity >= Math.min(requirement.quantity, 1) && listing.availableQuantity > 0 },
    {
      key: "price",
      ok: listing.expectedPrice != null && requirement.targetPrice != null && listing.expectedPrice <= requirement.targetPrice,
    },
  ];
  if (listingPoint && requirementPoint) {
    checks.push({ key: "nearby", ok: haversineKm(requirementPoint, listingPoint) <= 50 });
  }
  return checks;
}

export function distanceLabel(meters?: number) {
  if (meters == null) return null;
  const km = meters / 1000;
  if (km < 1) return `${Math.round(meters)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
