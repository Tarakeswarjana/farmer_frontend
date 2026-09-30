import { SimpleShell } from "@/components/layout/shells";
import { AUTHENTICATED_ROLES } from "@/lib/auth/roles";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SimpleShell allow={AUTHENTICATED_ROLES} home="/profile">{children}</SimpleShell>;
}
