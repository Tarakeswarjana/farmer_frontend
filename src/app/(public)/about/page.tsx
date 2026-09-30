import type { Metadata } from "next";
import { AboutPage } from "@/features/public/screens";
export const metadata: Metadata = { title: "About", description: "How the West Bengal vegetable marketplace works.", alternates: { canonical: "/about" } };
export default function Page() { return <AboutPage />; }
