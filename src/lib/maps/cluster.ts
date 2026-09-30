import type { GeoPoint } from "@/types/api";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "listing" | "market" | "farmer" | "buyer" | "transporter" | "collection";
}

export interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  markers: MapMarker[];
}

export function clusterMarkers(markers: MapMarker[], cell = 0.08): Cluster[] {
  const groups = new Map<string, MapMarker[]>();
  for (const marker of markers.slice(0, 200)) {
    const key = `${Math.floor(marker.lat / cell)}:${Math.floor(marker.lng / cell)}`;
    const list = groups.get(key) ?? [];
    list.push(marker);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([id, items]) => {
    const lat = items.reduce((sum, item) => sum + item.lat, 0) / items.length;
    const lng = items.reduce((sum, item) => sum + item.lng, 0) / items.length;
    return { id, lat, lng, count: items.length, markers: items };
  });
}

export function pointToMarker(id: string, label: string, kind: MapMarker["kind"], point: GeoPoint | null | undefined): MapMarker | null {
  const coordinates = point?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;
  const lng = coordinates[0];
  const lat = coordinates[1];
  if (lat == null || lng == null) return null;
  return { id, lat, lng, label, kind };
}
