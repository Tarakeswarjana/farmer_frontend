import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pwa files", () => {
  it("ships an installable manifest and a service worker with an offline fallback", () => {
    const manifest = JSON.parse(readFileSync("public/manifest.json", "utf8")) as { name: string; icons: unknown[]; display: string };
    const worker = readFileSync("public/sw.js", "utf8");
    expect(manifest.name).toBe("Sabji Haat");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
    expect(worker).toContain("/offline");
    expect(worker).toContain("payment");
  });
});
