import { describe, expect, it } from "vitest";
import { ApiError, messageForStatus, toApiError } from "@/lib/api/errors";

describe("api errors", () => {
  it("hides server stack details and maps known statuses", () => {
    expect(messageForStatus(401, "jwt exploded")).toMatch(/session/i);
    expect(messageForStatus(403, "nope")).toMatch(/permission/i);
    expect(messageForStatus(409, "already sold")).toMatch(/already sold/i);
    expect(messageForStatus(500, "Error: at Object.<anonymous> (/src/secret.js:1)")).toMatch(/try again/i);
  });

  it("turns a network failure into an offline error", () => {
    const error = toApiError({ message: "Network Error" });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Internet connection/i);
  });
});
