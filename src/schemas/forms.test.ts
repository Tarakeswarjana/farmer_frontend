import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema } from "@/schemas/forms";

describe("auth forms", () => {
  it("accepts a phone and password", () => {
    expect(loginSchema.safeParse({ identifier: "9810000001", password: "Demo@12345" }).success).toBe(true);
  });

  it("accepts a 6 letter password", () => {
    expect(passwordSchema.safeParse("abcdef").success).toBe(true);
  });

  it("rejects a password shorter than 6 letters", () => {
    expect(passwordSchema.safeParse("abcde").success).toBe(false);
  });
});
