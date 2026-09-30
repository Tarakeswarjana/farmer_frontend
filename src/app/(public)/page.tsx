import type { Metadata } from "next";
import { HomePage } from "@/features/public/screens";

export const metadata: Metadata = {
  title: "Sabji Haat",
  description: "Farmer to wholesale vegetable marketplace for Kolkata and North 24 Parganas.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sabji Haat",
  applicationCategory: "BusinessApplication",
  areaServed: "West Bengal, India",
  inLanguage: ["bn", "en"],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomePage />
    </>
  );
}
