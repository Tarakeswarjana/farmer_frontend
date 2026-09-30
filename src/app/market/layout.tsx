import { SimpleShell } from "@/components/layout/shells";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SimpleShell allow={["MARKET_MANAGER", "ADMIN", "SUPER_ADMIN"]} home="/market/dashboard">{children}</SimpleShell>;
}
