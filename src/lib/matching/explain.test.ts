import { describe, expect, it } from "vitest";
import { explainSupplyMatch } from "@/lib/matching/explain";
import type { Listing, Requirement } from "@/types/api";

const requirement = {
  _id: "req",
  buyerId: "b",
  buyerProfileId: null,
  cropId: "crop",
  quantity: 500,
  fulfilledQuantity: 0,
  unit: "KG",
  targetPrice: 30,
  qualityGrade: "A",
  requiredDate: "2026-10-01",
  marketId: null,
  district: null,
  state: null,
  location: { type: "Point", coordinates: [88.48, 22.72] },
  notes: null,
  status: "OPEN",
} as Requirement;

const listing = {
  _id: "list",
  farmerId: "f",
  farmerProfileId: null,
  fpoId: null,
  cropId: "crop",
  title: "Tomato",
  description: null,
  quantity: 800,
  availableQuantity: 800,
  unit: "KG",
  qualityGrade: "A",
  qualityParameters: {},
  expectedPrice: 28,
  minimumPrice: null,
  harvestDate: "2026-10-01",
  availableFrom: "2026-10-01",
  availableUntil: "2026-10-02",
  location: { type: "Point", coordinates: [88.5, 22.74] },
  pickupLocation: null,
  preferredMarketId: null,
  district: "North 24 Parganas",
  state: "West Bengal",
  images: [],
  status: "ACTIVE",
  isNegotiable: true,
  allowBidding: true,
} as Listing;

describe("match explanation", () => {
  it("checks visible facts and does not invent a rank score", () => {
    const checks = explainSupplyMatch(requirement, listing);
    expect(checks.map((check) => check.key)).toEqual(["sameCrop", "quantity", "price", "nearby"]);
    expect(checks.every((check) => check.ok)).toBe(true);
    expect(checks).not.toHaveProperty("score");
  });
});
