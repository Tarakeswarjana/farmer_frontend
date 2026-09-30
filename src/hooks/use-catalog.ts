"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { cropsApi } from "@/lib/api/crops";
import { marketsApi } from "@/lib/api/markets";
import { CACHE_TTL, readCache, writeCache } from "@/lib/offline/cache";
import { queryKeys } from "@/lib/query/client";
import type { Crop, Market, Page } from "@/types/api";

async function loadCrops(signal?: AbortSignal) {
  try {
    const page = await cropsApi.list({ limit: 100, sortBy: "name", sortOrder: "asc" }, signal);
    writeCache("crops", page);
    return page;
  } catch (error) {
    const cached = readCache<Page<Crop>>("crops", CACHE_TTL.crops);
    if (cached) return cached;
    throw error;
  }
}

async function loadMarkets(signal?: AbortSignal) {
  try {
    const page = await marketsApi.list({ limit: 100, sortBy: "name", sortOrder: "asc" }, signal);
    writeCache("markets", page);
    return page;
  } catch (error) {
    const cached = readCache<Page<Market>>("markets", CACHE_TTL.markets);
    if (cached) return cached;
    throw error;
  }
}

export function useCatalog() {
  const locale = useLocale();
  const crops = useQuery({ queryKey: queryKeys.crops({ limit: 100 }), queryFn: ({ signal }) => loadCrops(signal), staleTime: 60 * 60 * 1000 });
  const markets = useQuery({ queryKey: queryKeys.markets({ limit: 100 }), queryFn: ({ signal }) => loadMarkets(signal), staleTime: 30 * 60 * 1000 });
  const cropById = (id?: string | null) => crops.data?.items.find((crop) => crop._id === id);
  const marketById = (id?: string | null) => markets.data?.items.find((market) => market._id === id);
  const label = (id?: string | null) => {
    const crop = cropById(id);
    if (!crop) return "";
    return locale === "bn" && crop.bengaliName ? crop.bengaliName : crop.name ?? "";
  };
  return { crops, markets, cropById, marketById, label, locale };
}
