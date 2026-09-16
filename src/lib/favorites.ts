import type { AnimeSummary } from "@/lib/anilist";

const STORAGE_KEY = "aniscreener:favorites";
const CHANGE_EVENT = "aniscreener:favorites-changed";
const EMPTY: AnimeSummary[] = [];

let cachedSnapshot: AnimeSummary[] | null = null;

function readAll(): Record<number, AnimeSummary> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<number, AnimeSummary>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    cachedSnapshot = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // storage unavailable (private mode, quota) — favoriting just won't persist
  }
}

export function onFavoritesChange(handler: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// Cached so repeated calls return the same reference between writes —
// required for useSyncExternalStore to avoid re-render loops.
export function getFavorites(): AnimeSummary[] {
  if (!cachedSnapshot) {
    cachedSnapshot = Object.values(readAll()).sort((a, b) => a.title.localeCompare(b.title));
  }
  return cachedSnapshot;
}

export function getFavoritesServerSnapshot(): AnimeSummary[] {
  return EMPTY;
}

export function isFavorite(id: number): boolean {
  return id in readAll();
}

export function toggleFavorite(anime: AnimeSummary): boolean {
  const all = readAll();
  const nowFavorite = !(anime.id in all);
  if (nowFavorite) {
    all[anime.id] = anime;
  } else {
    delete all[anime.id];
  }
  writeAll(all);
  return nowFavorite;
}

export function mergeFavorites(list: AnimeSummary[]) {
  const all = readAll();
  for (const anime of list) all[anime.id] = anime;
  writeAll(all);
}
