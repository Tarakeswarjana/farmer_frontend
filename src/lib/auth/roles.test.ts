import { describe, expect, it } from "vitest";
import { dashboardPath, hasRole } from "@/lib/auth/roles";

describe("role routing", () => {
  it("sends each role to its dashboard", () => {
    expect(dashboardPath("FARMER")).toBe("/farmer/dashboard");
    expect(dashboardPath("FPO_ADMIN")).toBe("/fpo/dashboard");
    expect(dashboardPath("BUYER")).toBe("/buyer/dashboard");
    expect(dashboardPath("TRADER")).toBe("/buyer/dashboard");
    expect(dashboardPath("RETAILER")).toBe("/buyer/dashboard");
    expect(dashboardPath("RESTAURANT")).toBe("/buyer/dashboard");
    expect(dashboardPath("TRANSPORTER")).toBe("/transporter/dashboard");
    expect(dashboardPath("MARKET_MANAGER")).toBe("/market/dashboard");
    expect(dashboardPath("ADMIN")).toBe("/admin/dashboard");
    expect(dashboardPath("SUPER_ADMIN")).toBe("/admin/dashboard");
  });

  it("allows a farmer onto farmer routes and blocks a buyer", () => {
    expect(hasRole("FARMER", ["FARMER"], ["FARMER", "FPO_ADMIN"])).toBe(true);
    expect(hasRole("BUYER", ["BUYER"], ["FARMER", "FPO_ADMIN"])).toBe(false);
  });
});
