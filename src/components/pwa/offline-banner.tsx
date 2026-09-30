"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function OfflineBanner() {
  const t = useTranslations("common");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-50 bg-earth px-4 py-2 text-center text-sm font-semibold text-white">
      {t("offline")}
    </div>
  );
}
