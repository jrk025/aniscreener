"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { browseAnime, type AnimeSummary } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import { SearchIcon, XIcon } from "@/components/icons";
import {
  browseCacheKey,
  getCachedPage,
  getRecentSearches,
  getRecentSearchesServerSnapshot,
  onRecentSearchesChange,
  pushRecentSearch,
  setCachedPage,
} from "@/lib/animeCache";
import { getFavorites, getFavoritesServerSnapshot, onFavoritesChange } from "@/lib/favorites";
import { downloadBackup, isBackupFile, restoreBackup, type BackupFile } from "@/lib/backup";

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export default function AnimeBrowser() {
  const [view, setView] = useState<"all" | "favorites">("all");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [results, setResults] = useState<AnimeSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const importInputRef = useRef<HTMLInputElement>(null);

  const recentSearches = useSyncExternalStore(
    onRecentSearchesChange,
    getRecentSearches,
    getRecentSearchesServerSnapshot
  );
  const favorites = useSyncExternalStore(onFavoritesChange, getFavorites, getFavoritesServerSnapshot);

  useEffect(() => {
    if (view !== "all") return;
    const id = ++requestId.current;
    const timeout = setTimeout(async () => {
      const trimmed = query.trim();
      const key = browseCacheKey(trimmed, genre, 1);
      const cached = getCachedPage(key);
      const data = cached ?? (await browseAnime(trimmed, 1, 24, genre ?? undefined));
      if (requestId.current !== id) return;
      if (!cached) setCachedPage(key, data);
      setResults(data.results);
      setHasNextPage(data.hasNextPage);
      setPage(1);
      setLoading(false);
      if (trimmed) pushRecentSearch(trimmed);
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, genre, view]);

  function updateQuery(value: string) {
    setQuery(value);
    setLoading(true);
  }

  function selectGenre(value: string) {
    setGenre((current) => (current === value ? null : value));
    setLoading(true);
  }

  async function loadMore() {
    setLoadingMore(true);
    const trimmed = query.trim();
    const nextPage = page + 1;
    const key = browseCacheKey(trimmed, genre, nextPage);
    const cached = getCachedPage(key);
    const data = cached ?? (await browseAnime(trimmed, nextPage, 24, genre ?? undefined));
    if (!cached) setCachedPage(key, data);
    setResults((prev) => [...prev, ...data.results]);
    setHasNextPage(data.hasNextPage);
    setPage(nextPage);
    setLoadingMore(false);
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!isBackupFile(parsed)) {
          setImportMessage("That doesn't look like an AniScreener backup file.");
          return;
        }
        restoreBackup(parsed as BackupFile);
        setImportMessage("Backup restored.");
      } catch {
        setImportMessage("Couldn't read that file.");
      }
    };
    reader.readAsText(file);
  }

  const favoriteResults = favorites.filter((anime) =>
    anime.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mt-6 space-y-6">
      <div className="flex gap-1 rounded-full border border-border p-1 w-fit">
        {(["all", "favorites"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setView(tab)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              view === tab ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {tab === "all" ? "All anime" : `Favorites${favorites.length ? ` (${favorites.length})` : ""}`}
          </button>
        ))}
      </div>

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          type="text"
          placeholder={view === "all" ? "Search anime by title…" : "Filter your favorites…"}
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-accent/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => updateQuery("")}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {view === "all" && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => selectGenre(g)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                genre === g
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {view === "all" && !query && recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Recent:</span>
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => updateQuery(term)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {view === "favorites" ? (
        favorites.length === 0 ? (
          <p className="text-sm text-muted">
            No favorites yet. Tap the heart on any anime to save it here. Favorites are stored only in this
            browser.
          </p>
        ) : favoriteResults.length === 0 ? (
          <p className="text-sm text-muted">No favorites match &quot;{query}&quot;.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteResults.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )
      ) : loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted">No anime found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      {view === "favorites" && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={downloadBackup}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Export backup
          </button>
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            Import backup
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          {importMessage && <span className="text-xs text-muted">{importMessage}</span>}
        </div>
      )}
    </div>
  );
}
