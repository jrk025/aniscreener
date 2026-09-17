import type { AnimeSummary } from "@/lib/anilist";

export type WatchStatus = "plan_to_watch" | "watching" | "completed" | "on_hold" | "dropped";

export interface WatchListEntry {
  anime: AnimeSummary;
  status: WatchStatus;
  updatedAt: string;
}

const STORAGE_KEY = "aniscreener:watchlist";
const CHANGE_EVENT = "aniscreener:watchlist-changed";
const EMPTY: WatchListEntry[] = [];

let cachedSnapshot: WatchListEntry[] | null = null;

function readAll(): Record<number, WatchListEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<number, WatchListEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    cachedSnapshot = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // storage unavailable, changes just won't persist
  }
}

export function onWatchListChange(handler: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// Cached so repeated calls return the same reference between writes.
// This is required by useSyncExternalStore to avoid re-render loops.
export function getWatchList(): WatchListEntry[] {
  if (!cachedSnapshot) {
    cachedSnapshot = Object.values(readAll()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return cachedSnapshot;
}

export function getWatchListServerSnapshot(): WatchListEntry[] {
  return EMPTY;
}

export function getStatus(id: number): WatchStatus | null {
  return readAll()[id]?.status ?? null;
}

export function setStatus(anime: AnimeSummary, status: WatchStatus) {
  const all = readAll();
  all[anime.id] = { anime, status, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export function removeStatus(id: number) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function mergeWatchList(list: WatchListEntry[]) {
  const all = readAll();
  for (const entry of list) all[entry.anime.id] = entry;
  writeAll(all);
}
