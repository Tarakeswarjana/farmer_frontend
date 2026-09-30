import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/app");

const pages = {
  "(public)/page.tsx": `import { HomePage } from "@/features/public/screens";
export default function Page() { return <HomePage />; }
`,
  "(public)/about/page.tsx": `import type { Metadata } from "next";
import { AboutPage } from "@/features/public/screens";
export const metadata: Metadata = { title: "About", description: "How the West Bengal vegetable marketplace works.", alternates: { canonical: "/about" } };
export default function Page() { return <AboutPage />; }
`,
  "(public)/vegetables/page.tsx": `import type { Metadata } from "next";
import { VegetableDirectory } from "@/features/public/screens";
export const metadata: Metadata = { title: "Vegetables", description: "Vegetable catalog for Kolkata and North 24 Parganas.", alternates: { canonical: "/vegetables" } };
export default function Page() { return <VegetableDirectory />; }
`,
  "(public)/vegetables/[id]/page.tsx": `import { VegetableDetail } from "@/features/public/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VegetableDetail id={id} />;
}
`,
  "(public)/markets/page.tsx": `import type { Metadata } from "next";
import { MarketDirectory } from "@/features/public/screens";
export const metadata: Metadata = { title: "Markets", description: "Mandis and krishak bazars in West Bengal.", alternates: { canonical: "/markets" } };
export default function Page() { return <MarketDirectory />; }
`,
  "(public)/markets/[id]/page.tsx": `import { MarketDetail } from "@/features/public/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MarketDetail id={id} />;
}
`,
  "(public)/markets/prices/page.tsx": `import { PriceBoard } from "@/features/buyer/screens";
export default function Page() { return <PriceBoard />; }
`,
  "(public)/listings/page.tsx": `import type { Metadata } from "next";
import { PublicListings } from "@/features/public/screens";
export const metadata: Metadata = { title: "Listings", description: "Live vegetable supply from farmers.", alternates: { canonical: "/listings" } };
export default function Page() { return <PublicListings />; }
`,
  "(public)/listings/[id]/page.tsx": `import { PublicListing } from "@/features/public/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicListing id={id} />;
}
`,
  "auth/login/page.tsx": `import { Suspense } from "react";
import { LoginScreen } from "@/features/auth/screens";
export default function Page() { return <Suspense><LoginScreen /></Suspense>; }
`,
  "auth/register/page.tsx": `import { RegisterScreen } from "@/features/auth/screens";
export default function Page() { return <RegisterScreen />; }
`,
  "auth/verify-phone/page.tsx": `import { VerifyPhoneScreen } from "@/features/auth/screens";
export default function Page() { return <VerifyPhoneScreen />; }
`,
  "auth/forgot-password/page.tsx": `import { ForgotPasswordScreen } from "@/features/auth/screens";
export default function Page() { return <ForgotPasswordScreen />; }
`,
  "auth/reset-password/page.tsx": `import { ResetPasswordScreen } from "@/features/auth/screens";
export default function Page() { return <ResetPasswordScreen />; }
`,
  "farmer/dashboard/page.tsx": `import { FarmerDashboard } from "@/features/farmer/screens";
export default function Page() { return <FarmerDashboard />; }
`,
  "farmer/listings/page.tsx": `import { FarmerListings } from "@/features/farmer/screens";
export default function Page() { return <FarmerListings />; }
`,
  "farmer/listings/new/page.tsx": `import { ListingWizard } from "@/features/farmer/screens";
export default function Page() { return <ListingWizard />; }
`,
  "farmer/listings/[id]/page.tsx": `import { ListingManage } from "@/features/farmer/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingManage id={id} />;
}
`,
  "farmer/listings/[id]/edit/page.tsx": `import { ListingWizard } from "@/features/farmer/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingWizard listingId={id} />;
}
`,
  "farmer/offers/page.tsx": `import { FarmerOffers } from "@/features/farmer/screens";
export default function Page() { return <FarmerOffers />; }
`,
  "farmer/orders/page.tsx": `import { FarmerOrders } from "@/features/farmer/screens";
export default function Page() { return <FarmerOrders />; }
`,
  "farmer/orders/[id]/page.tsx": `import { Suspense } from "react";
import { OrderDetail } from "@/features/orders/detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><OrderDetail id={id} /></Suspense>;
}
`,
  "farmer/earnings/page.tsx": `import { FarmerEarnings } from "@/features/farmer/screens";
export default function Page() { return <FarmerEarnings />; }
`,
  "farmer/profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
  "farmer/notifications/page.tsx": `import { NotificationCenter } from "@/features/notifications/center";
export default function Page() { return <NotificationCenter />; }
`,
  "buyer/dashboard/page.tsx": `import { BuyerDashboard } from "@/features/buyer/screens";
export default function Page() { return <BuyerDashboard />; }
`,
  "buyer/marketplace/page.tsx": `import { Suspense } from "react";
import { Marketplace } from "@/features/buyer/screens";
export default async function Page({ searchParams }: { searchParams: Promise<{ cropId?: string }> }) {
  const params = await searchParams;
  return <Suspense><Marketplace initialCropId={params.cropId} /></Suspense>;
}
`,
  "buyer/marketplace/[id]/page.tsx": `import { ListingDetail } from "@/features/buyer/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetail id={id} />;
}
`,
  "buyer/requirements/page.tsx": `import { RequirementList } from "@/features/buyer/screens";
export default function Page() { return <RequirementList />; }
`,
  "buyer/requirements/new/page.tsx": `import { RequirementWizard } from "@/features/buyer/screens";
export default function Page() { return <RequirementWizard />; }
`,
  "buyer/requirements/[id]/page.tsx": `import { RequirementMatches } from "@/features/buyer/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequirementMatches id={id} />;
}
`,
  "buyer/offers/page.tsx": `import { BuyerOffers } from "@/features/buyer/screens";
export default function Page() { return <BuyerOffers />; }
`,
  "buyer/orders/page.tsx": `import { BuyerOrders } from "@/features/buyer/screens";
export default function Page() { return <BuyerOrders />; }
`,
  "buyer/orders/[id]/page.tsx": `import { Suspense } from "react";
import { OrderDetail } from "@/features/orders/detail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><OrderDetail id={id} /></Suspense>;
}
`,
  "buyer/payments/page.tsx": `import { BuyerOrders } from "@/features/buyer/screens";
export default function Page() { return <BuyerOrders />; }
`,
  "buyer/favorites/page.tsx": `import { Favorites } from "@/features/buyer/screens";
export default function Page() { return <Favorites />; }
`,
  "buyer/markets/page.tsx": `import { PriceBoard } from "@/features/buyer/screens";
export default function Page() { return <PriceBoard />; }
`,
  "buyer/profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
  "buyer/notifications/page.tsx": `import { NotificationCenter } from "@/features/notifications/center";
export default function Page() { return <NotificationCenter />; }
`,
  "fpo/dashboard/page.tsx": `import { FpoDashboard } from "@/features/roles/screens";
export default function Page() { return <FpoDashboard />; }
`,
  "fpo/members/page.tsx": `import { FpoMembers } from "@/features/roles/screens";
export default function Page() { return <FpoMembers />; }
`,
  "fpo/listings/page.tsx": `import { FpoListings } from "@/features/roles/screens";
export default function Page() { return <FpoListings />; }
`,
  "fpo/sales/page.tsx": `import { FpoSales } from "@/features/roles/screens";
export default function Page() { return <FpoSales />; }
`,
  "fpo/profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
  "transporter/dashboard/page.tsx": `import { TransporterJobs } from "@/features/roles/screens";
export default function Page() { return <TransporterJobs />; }
`,
  "transporter/available/page.tsx": `import { TransporterJobs } from "@/features/roles/screens";
export default function Page() { return <TransporterJobs />; }
`,
  "transporter/assigned/page.tsx": `import { TransporterDeliveries } from "@/features/roles/screens";
export default function Page() { return <TransporterDeliveries />; }
`,
  "transporter/deliveries/page.tsx": `import { TransporterDeliveries } from "@/features/roles/screens";
export default function Page() { return <TransporterDeliveries />; }
`,
  "transporter/deliveries/[id]/page.tsx": `import { DeliveryDetail } from "@/features/roles/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeliveryDetail id={id} />;
}
`,
  "transporter/profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
  "market/dashboard/page.tsx": `import { MarketDashboard } from "@/features/roles/screens";
export default function Page() { return <MarketDashboard />; }
`,
  "market/prices/page.tsx": `import { MarketPriceEntry } from "@/features/roles/screens";
export default function Page() { return <MarketPriceEntry />; }
`,
  "market/profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
  "admin/dashboard/page.tsx": `import { AdminDashboard } from "@/features/admin/screens";
export default function Page() { return <AdminDashboard />; }
`,
  "admin/users/page.tsx": `import { AdminUsers } from "@/features/admin/screens";
export default function Page() { return <AdminUsers />; }
`,
  "admin/farmers/page.tsx": `import { AdminFarmers } from "@/features/admin/screens";
export default function Page() { return <AdminFarmers />; }
`,
  "admin/buyers/page.tsx": `import { AdminBuyers } from "@/features/admin/screens";
export default function Page() { return <AdminBuyers />; }
`,
  "admin/fpos/page.tsx": `import { AdminFpos } from "@/features/admin/screens";
export default function Page() { return <AdminFpos />; }
`,
  "admin/markets/page.tsx": `import { AdminMarkets } from "@/features/admin/screens";
export default function Page() { return <AdminMarkets />; }
`,
  "admin/crops/page.tsx": `import { AdminCrops } from "@/features/admin/screens";
export default function Page() { return <AdminCrops />; }
`,
  "admin/listings/page.tsx": `import { AdminListings } from "@/features/admin/screens";
export default function Page() { return <AdminListings />; }
`,
  "admin/offers/page.tsx": `import { AdminOffersNote } from "@/features/admin/screens";
export default function Page() { return <AdminOffersNote />; }
`,
  "admin/orders/page.tsx": `import { AdminOrders } from "@/features/admin/screens";
export default function Page() { return <AdminOrders />; }
`,
  "admin/payments/page.tsx": `import { AdminPayments } from "@/features/admin/screens";
export default function Page() { return <AdminPayments />; }
`,
  "admin/deliveries/page.tsx": `import { AdminDeliveries } from "@/features/admin/screens";
export default function Page() { return <AdminDeliveries />; }
`,
  "admin/prices/page.tsx": `import { AdminPrices } from "@/features/admin/screens";
export default function Page() { return <AdminPrices />; }
`,
  "admin/disputes/page.tsx": `import { AdminDisputes } from "@/features/admin/screens";
export default function Page() { return <AdminDisputes />; }
`,
  "admin/reports/page.tsx": `import { AdminReports } from "@/features/admin/screens";
export default function Page() { return <AdminReports />; }
`,
  "admin/settings/page.tsx": `import { AdminSettings } from "@/features/admin/screens";
export default function Page() { return <AdminSettings />; }
`,
  "messages/page.tsx": `import { ConversationList } from "@/features/chat/screens";
export default function Page() { return <ConversationList />; }
`,
  "messages/[id]/page.tsx": `import { ChatThread } from "@/features/chat/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatThread id={id} />;
}
`,
  "notifications/page.tsx": `import { NotificationCenter } from "@/features/notifications/center";
export default function Page() { return <NotificationCenter />; }
`,
  "profile/page.tsx": `import { ProfileEditor } from "@/features/roles/screens";
export default function Page() { return <ProfileEditor />; }
`,
};

for (const [file, contents] of Object.entries(pages)) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}
console.log("wrote", Object.keys(pages).length, "pages");
