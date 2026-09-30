const PREFIX = "vm.cache.v1.";

interface Entry<T> {
  savedAt: number;
  value: T;
}

export function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    const entry: Entry<T> = { savedAt: Date.now(), value };
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota or private mode */
  }
}

export function readCache<T>(key: string, maxAgeMs: number): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.savedAt > maxAgeMs) return null;
    return entry.value;
  } catch {
    return null;
  }
}

export const CACHE_TTL = {
  crops: 1000 * 60 * 60 * 24,
  markets: 1000 * 60 * 60 * 12,
  profile: 1000 * 60 * 30,
  listings: 1000 * 60 * 60,
};
