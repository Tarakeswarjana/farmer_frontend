import { Suspense } from "react";
import { Marketplace } from "@/features/buyer/screens";
export default async function Page({ searchParams }: { searchParams: Promise<{ cropId?: string }> }) {
  const params = await searchParams;
  return <Suspense><Marketplace initialCropId={params.cropId} /></Suspense>;
}
