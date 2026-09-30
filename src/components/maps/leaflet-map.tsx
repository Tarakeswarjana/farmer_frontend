"use client";

import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { clusterMarkers, type MapMarker } from "@/lib/maps/cluster";
import "leaflet/dist/leaflet.css";

export default function LeafletMap({ markers }: { markers: MapMarker[] }) {
  const clusters = useMemo(() => clusterMarkers(markers), [markers]);
  const center = clusters[0] ?? { lat: 22.72, lng: 88.48 };
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={10} className="h-72 w-full rounded-2xl md:h-96" scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {clusters.map((cluster) => (
        <CircleMarker key={cluster.id} center={[cluster.lat, cluster.lng]} radius={cluster.count > 1 ? 16 : 10} pathOptions={{ color: "#1B5E20", fillColor: "#2F7D32", fillOpacity: 0.85 }}>
          <Tooltip>{cluster.count > 1 ? `${cluster.count}` : cluster.markers[0]?.label}</Tooltip>
          <Popup>
            <ul className="max-h-40 space-y-1 overflow-auto text-sm">
              {cluster.markers.slice(0, 12).map((marker) => (
                <li key={marker.id}>
                  {marker.kind}: {marker.label}
                </li>
              ))}
            </ul>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
