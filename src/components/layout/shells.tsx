"use client";

import { Home, IndianRupee, Package, Sprout, UserRound, ClipboardList, Search, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { BUYER_ROLES, FARMER_ROLES, dashboardPath, hasRole } from "@/lib/auth/roles";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/api";

function useGuard(allowed: readonly Role[]) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const allowKey = allowed.join("|");
  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (!hasRole(user.role, user.roles, allowed)) router.replace(dashboardPath(user.role));
    // allowKey tracks the role list without changing identity each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowKey, router, status, user]);
  return { user, status };
}

export function FarmerShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const { status } = useGuard(FARMER_ROLES);
  if (status !== "authenticated") return <DashboardSkeleton />;
  const items = [
    { href: "/farmer/dashboard", label: t("farmerHome"), icon: <Home size={22} /> },
    { href: "/farmer/listings", label: t("farmerVeg"), icon: <Sprout size={22} /> },
    { href: "/farmer/orders", label: t("farmerOrders"), icon: <Package size={22} /> },
    { href: "/farmer/earnings", label: t("farmerEarnings"), icon: <IndianRupee size={22} /> },
    { href: "/farmer/profile", label: t("farmerProfile"), icon: <UserRound size={22} /> },
  ];
  return (
    <div className="farmer-ui mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
      <AppHeader home="/farmer/dashboard" />
      {children}
      <MobileBottomNav items={items} />
    </div>
  );
}

export function BuyerShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const { status } = useGuard(BUYER_ROLES);
  if (status !== "authenticated") return <DashboardSkeleton />;
  const items = [
    { href: "/buyer/dashboard", label: t("buyerHome"), icon: <Home size={22} /> },
    { href: "/buyer/marketplace", label: t("buyerMarket"), icon: <Search size={22} /> },
    { href: "/buyer/requirements", label: t("buyerNeeds"), icon: <ClipboardList size={22} /> },
    { href: "/buyer/orders", label: t("buyerOrders"), icon: <Package size={22} /> },
    { href: "/buyer/profile", label: t("buyerProfile"), icon: <UserRound size={22} /> },
  ];
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-4">
      <AppHeader home="/buyer/dashboard" />
      {children}
      <MobileBottomNav items={items} />
    </div>
  );
}

export function TransporterShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const { status } = useGuard(["TRANSPORTER"]);
  if (status !== "authenticated") return <DashboardSkeleton />;
  const items = [
    { href: "/transporter/dashboard", label: t("transportHome"), icon: <Home size={22} /> },
    { href: "/transporter/available", label: t("transportJobs"), icon: <Truck size={22} /> },
    { href: "/transporter/deliveries", label: t("transportDeliveries"), icon: <Package size={22} /> },
    { href: "/transporter/assigned", label: t("transportEarnings"), icon: <IndianRupee size={22} /> },
    { href: "/transporter/profile", label: t("transportProfile"), icon: <UserRound size={22} /> },
  ];
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
      <AppHeader home="/transporter/dashboard" />
      {children}
      <MobileBottomNav items={items} />
    </div>
  );
}

export function SimpleShell({ children, allow, home }: { children: React.ReactNode; allow: readonly Role[]; home: string }) {
  const { status } = useGuard(allow);
  if (status !== "authenticated") return <DashboardSkeleton />;
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-4">
      <AppHeader home={home} />
      {children}
    </div>
  );
}

const adminItems = [
  ["Dashboard", "/admin/dashboard"],
  ["Users", "/admin/users"],
  ["Farmers", "/admin/farmers"],
  ["Buyers", "/admin/buyers"],
  ["FPOs", "/admin/fpos"],
  ["Markets", "/admin/markets"],
  ["Crops", "/admin/crops"],
  ["Listings", "/admin/listings"],
  ["Offers", "/admin/offers"],
  ["Orders", "/admin/orders"],
  ["Payments", "/admin/payments"],
  ["Deliveries", "/admin/deliveries"],
  ["Market Prices", "/admin/prices"],
  ["Disputes", "/admin/disputes"],
  ["Reports", "/admin/reports"],
  ["Settings", "/admin/settings"],
].map(([label, href]) => ({ label, href }));

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { status } = useGuard(["ADMIN", "SUPER_ADMIN"]);
  if (status !== "authenticated") return <DashboardSkeleton />;
  return (
    <div className="min-h-screen lg:flex">
      <DesktopSidebar items={adminItems} />
      <div className="min-w-0 flex-1 px-4 py-4">
        <AppHeader home="/admin/dashboard" />
        {children}
      </div>
    </div>
  );
}
