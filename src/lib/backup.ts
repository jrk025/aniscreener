import type { AnimeSummary } from "@/lib/anilist";
import { getFavorites, mergeFavorites } from "@/lib/favorites";
import { getRecentSearches, mergeRecentSearches } from "@/lib/animeCache";
import { getWatchList, mergeWatchList, type WatchListEntry } from "@/lib/watchStatus";

const LAST_EXPORT_KEY = "aniscreener:last-export";
const REMINDER_DISMISSED_KEY = "aniscreener:reminder-dismissed";
const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

export interface BackupFile {
  app: "aniscreener";
  version: 1;
  exportedAt: string;
  favorites: AnimeSummary[];
  recentSearches: string[];
  watchList?: WatchListEntry[];
}

export function buildBackup(): BackupFile {
  return {
    app: "aniscreener",
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: getFavorites(),
    recentSearches: getRecentSearches(),
    watchList: getWatchList(),
  };
}

export function markExported() {
  try {
    localStorage.setItem(LAST_EXPORT_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

export function downloadBackup() {
  const data = buildBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aniscreener-backup-${data.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  markExported();
}

export function isBackupFile(value: unknown): value is BackupFile {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).app === "aniscreener" &&
    Array.isArray((value as Record<string, unknown>).favorites)
  );
}

export function restoreBackup(data: BackupFile) {
  mergeFavorites(data.favorites);
  mergeRecentSearches(data.recentSearches ?? []);
  mergeWatchList(data.watchList ?? []);
}

function getTimestamp(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function dismissBackupReminder() {
  try {
    localStorage.setItem(REMINDER_DISMISSED_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

export function shouldShowBackupReminder(): boolean {
  if (getFavorites().length === 0 && getWatchList().length === 0) return false;

  const lastExport = getTimestamp(LAST_EXPORT_KEY);
  if (lastExport && Date.now() - lastExport < REMINDER_INTERVAL_MS) return false;

  const dismissed = getTimestamp(REMINDER_DISMISSED_KEY);
  if (dismissed && Date.now() - dismissed < REMINDER_INTERVAL_MS) return false;

  return true;
}
