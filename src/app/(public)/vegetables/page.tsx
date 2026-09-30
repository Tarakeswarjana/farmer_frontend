import type { Metadata } from "next";
import { VegetableDirectory } from "@/features/public/screens";
export const metadata: Metadata = { title: "Vegetables", description: "Vegetable catalog for Kolkata and North 24 Parganas.", alternates: { canonical: "/vegetables" } };
export default function Page() { return <VegetableDirectory />; }
