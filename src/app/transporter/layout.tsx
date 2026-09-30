import { TransporterShell } from "@/components/layout/shells";

export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TransporterShell>{children}</TransporterShell>;
}
