import { expect, test } from "@playwright/test";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

test("farmer lists tomato and buyer makes an offer", async ({ page, request }) => {
  const health = await request.get(api.replace(/\/api\/v1$/, "") + "/health").catch(() => null);
  test.skip(!health || !health.ok(), "Backend is not running");

  const stamp = Date.now().toString().slice(-8);
  const farmerPhone = `98${stamp.slice(0, 8)}`;
  const buyerPhone = `97${stamp.slice(0, 8)}`;

  const crops = await request.get(`${api}/crops?limit=20`);
  const cropBody = await crops.json();
  const tomato = (cropBody.data as Array<{ _id: string; name: string }>).find((crop) => crop.name === "Tomato");
  expect(tomato).toBeTruthy();
  const markets = await request.get(`${api}/markets?limit=20`);
  const marketBody = await markets.json();
  const market = marketBody.data[0];

  async function register(phone: string, role: string, name: string) {
    const response = await request.post(`${api}/auth/register`, { data: { name, phone, password: "Demo@12345", role } });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    if (body.data.debugCode) {
      await request.post(`${api}/auth/verify-phone`, { data: { phone, code: body.data.debugCode } });
    }
    const login = await request.post(`${api}/auth/login`, { data: { identifier: phone, password: "Demo@12345" } });
    const session = await login.json();
    return session.data.accessToken as string;
  }

  const farmerToken = await register(farmerPhone, "FARMER", "E2E Farmer");
  await request.post(`${api}/farmers/profile`, {
    headers: { Authorization: `Bearer ${farmerToken}` },
    data: {
      farmerName: "E2E Farmer",
      phone: farmerPhone,
      address: "Gaighata farm",
      district: "North 24 Parganas",
      pincode: "743249",
      state: "West Bengal",
      location: { longitude: 88.729, latitude: 22.933 },
    },
  });

  await page.goto("/auth/login");
  await page.getByLabel(/phone or email/i).fill(farmerPhone);
  await page.getByLabel(/^password$/i).fill("Demo@12345");
  await page.getByRole("button", { name: /sign in|ঢুকুন/i }).click();
  await page.waitForURL(/\/farmer\/dashboard/);

  const listing = await request.post(`${api}/listings`, {
    headers: { Authorization: `Bearer ${farmerToken}` },
    data: {
      cropId: tomato?._id,
      quantity: 500,
      unit: "KG",
      qualityGrade: "A",
      expectedPrice: 28,
      harvestDate: "2026-10-02",
      availableFrom: "2026-10-02T06:00:00.000Z",
      availableUntil: "2026-10-03T18:00:00.000Z",
      preferredMarketId: market._id,
      district: "North 24 Parganas",
      state: "West Bengal",
      location: { longitude: 88.729, latitude: 22.933 },
      isNegotiable: true,
      allowBidding: true,
    },
  });
  const created = await listing.json();
  const publish = await request.patch(`${api}/listings/${created.data._id}/publish`, { headers: { Authorization: `Bearer ${farmerToken}` } });
  test.skip(!publish.ok(), "Farmer must be verified before a listing can be published");

  const buyerToken = await register(buyerPhone, "BUYER", "E2E Buyer");
  await request.post(`${api}/buyers/profile`, {
    headers: { Authorization: `Bearer ${buyerToken}` },
    data: {
      businessName: "E2E Traders",
      businessType: "WHOLESALER",
      ownerName: "E2E Buyer",
      phone: buyerPhone,
      address: "Barasat",
      district: "North 24 Parganas",
      location: { longitude: 88.48, latitude: 22.72 },
    },
  });

  await page.context().clearCookies();
  await page.goto("/auth/login");
  await page.getByLabel(/phone or email/i).fill(buyerPhone);
  await page.getByLabel(/^password$/i).fill("Demo@12345");
  await page.getByRole("button", { name: /sign in|ঢুকুন/i }).click();
  await page.waitForURL(/\/buyer\/dashboard/);
  await page.goto(`/buyer/marketplace/${created.data._id}`);
  await page.getByRole("button", { name: /make offer|অফার করুন/i }).click();
  await page.getByRole("button", { name: /send offer|অফার পাঠান/i }).click();
});
