const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function formatRupees(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return inr.format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function sanitizeText(value: string | null | undefined) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "");
}

export function cropEmoji(name: string | null | undefined) {
  const key = (name ?? "").toLowerCase();
  const table: Record<string, string> = {
    potato: "🥔",
    tomato: "🍅",
    brinjal: "🍆",
    cauliflower: "🥦",
    cabbage: "🥬",
    onion: "🧅",
    pumpkin: "🎃",
    "bottle gourd": "🥒",
    "bitter gourd": "🥒",
    "green chili": "🌶️",
    "green chilli": "🌶️",
    cucumber: "🥒",
    okra: "🫛",
    carrot: "🥕",
    radish: "🥕",
    spinach: "🥬",
  };
  return table[key] ?? "🥬";
}

export function coordsOf(point?: { coordinates?: number[] } | null): { lat: number; lng: number } | null {
  const coordinates = point?.coordinates;
  if (!coordinates || coordinates.length < 2) return null;
  const lng = coordinates[0];
  const lat = coordinates[1];
  if (lng == null || lat == null) return null;
  return { lat, lng };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function assertOnline() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("Internet connection required to complete this action.");
  }
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
