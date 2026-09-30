import { SimpleShell } from "@/components/layout/shells";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SimpleShell allow={["FPO_ADMIN", "ADMIN", "SUPER_ADMIN"]} home="/fpo/dashboard">{children}</SimpleShell>;
}
