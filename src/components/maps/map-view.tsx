"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/lib/maps/cluster";
import { Skeleton } from "@/components/ui/skeleton";

const LeafletMap = dynamic(() => import("@/components/maps/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full" />,
});

export function MapView({ markers, title }: { markers: MapMarker[]; title?: string }) {
  const provider = process.env.NEXT_PUBLIC_MAP_PROVIDER;
  const key = process.env.NEXT_PUBLIC_MAP_API_KEY;
  const first = markers[0];
  if (provider === "google" && key && first) {
    const src = `https://www.google.com/maps?q=${first.lat},${first.lng}&z=12&output=embed`;
    return (
      <section aria-label={title ?? "Map"}>
        <iframe title={title ?? "Map"} src={src} className="h-72 w-full rounded-2xl border border-line md:h-96" loading="lazy" />
      </section>
    );
  }
  return (
    <section aria-label={title ?? "Map"}>
      <LeafletMap markers={markers} />
    </section>
  );
}
