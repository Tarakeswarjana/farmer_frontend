"use client";

import { useTranslations } from "next-intl";

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (value: { latitude: number; longitude: number }) => void;
}) {
  const t = useTranslations("common");
  return (
    <div className="space-y-3">
      <p className="text-muted">{t("locationHint")}</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">
          Latitude
          <input className="mt-1 min-h-14 w-full rounded-2xl border border-line bg-surface px-3 text-lg" inputMode="decimal" value={latitude} onChange={(event) => onChange({ latitude: Number(event.target.value), longitude })} />
        </label>
        <label className="block text-sm font-semibold">
          Longitude
          <input className="mt-1 min-h-14 w-full rounded-2xl border border-line bg-surface px-3 text-lg" inputMode="decimal" value={longitude} onChange={(event) => onChange({ latitude, longitude: Number(event.target.value) })} />
        </label>
      </div>
      <button
        type="button"
        className="min-h-14 rounded-2xl bg-brand-light px-4 font-semibold text-brand-dark"
        onClick={() => {
          navigator.geolocation?.getCurrentPosition((position) => {
            onChange({ latitude: Number(position.coords.latitude.toFixed(5)), longitude: Number(position.coords.longitude.toFixed(5)) });
          });
        }}
      >
        {t("useLocation")}
      </button>
    </div>
  );
}
