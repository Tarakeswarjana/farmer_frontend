import type { Metadata } from "next";
import { PublicListings } from "@/features/public/screens";
export const metadata: Metadata = { title: "Listings", description: "Live vegetable supply from farmers.", alternates: { canonical: "/listings" } };
export default function Page() { return <PublicListings />; }
