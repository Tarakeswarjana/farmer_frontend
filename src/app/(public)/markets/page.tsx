import type { Metadata } from "next";
import { MarketDirectory } from "@/features/public/screens";
export const metadata: Metadata = { title: "Markets", description: "Mandis and krishak bazars in West Bengal.", alternates: { canonical: "/markets" } };
export default function Page() { return <MarketDirectory />; }
