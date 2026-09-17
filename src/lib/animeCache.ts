import type { AnimeListPage } from "@/lib/anilist";

const CACHE_KEY = "aniscreener:browse-cache";
const RECENT_KEY = "aniscreener:recent-searches";
const RECENT_CHANGE_EVENT = "aniscreener:recent-changed";
const TTL_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 40;
const MAX_RECENT = 8;
const EMPTY: string[] = [];

interface CacheEntry {
  data: AnimeListPage;
  ts: number;
}

function readCache(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, CacheEntry>) {
  try {
    const trimmed = Object.entries(cache)
      .sort((a, b) => b[1].ts - a[1].ts)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // storage unavailable, cache just won't persist
  }
}

export function browseCacheKey(search: string, genre: string | null, page: number): string {
  return `${genre ?? ""}|${search.toLowerCase()}|${page}`;
}

export function getCachedPage(key: string): AnimeListPage | null {
  const entry = readCache()[key];
  if (!entry || Date.now() - entry.ts > TTL_MS) return null;
  return entry.data;
}

export function setCachedPage(key: string, data: AnimeListPage) {
  const cache = readCache();
  cache[key] = { data, ts: Date.now() };
  writeCache(cache);
}

let cachedRecent: string[] | null = null;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    cachedRecent = null;
    window.dispatchEvent(new Event(RECENT_CHANGE_EVENT));
  } catch {
    // storage unavailable, recents just won't persist
  }
}

export function onRecentSearchesChange(handler: () => void): () => void {
  window.addEventListener(RECENT_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(RECENT_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getRecentSearches(): string[] {
  if (!cachedRecent) cachedRecent = readRecent();
  return cachedRecent;
}

export function getRecentSearchesServerSnapshot(): string[] {
  return EMPTY;
}

export function pushRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed) return;
  const rest = readRecent().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
  writeRecent([trimmed, ...rest].slice(0, MAX_RECENT));
}

export function mergeRecentSearches(list: string[]) {
  const existing = readRecent();
  const merged = [...list, ...existing].filter(
    (term, index, arr) => arr.findIndex((t) => t.toLowerCase() === term.toLowerCase()) === index
  );
  writeRecent(merged.slice(0, MAX_RECENT));
}
