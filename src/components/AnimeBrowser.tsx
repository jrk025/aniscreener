"use client";

import { useEffect, useRef, useState } from "react";
import { browseAnime, type AnimeSummary } from "@/lib/anilist";
import AnimeCard from "@/components/AnimeCard";
import { SearchIcon, XIcon } from "@/components/icons";

export default function AnimeBrowser() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSummary[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    const timeout = setTimeout(async () => {
      const data = await browseAnime(query.trim(), 1);
      if (requestId.current !== id) return;
      setResults(data.results);
      setHasNextPage(data.hasNextPage);
      setPage(1);
      setLoading(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  function updateQuery(value: string) {
    setQuery(value);
    setLoading(true);
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await browseAnime(query.trim(), nextPage);
    setResults((prev) => [...prev, ...data.results]);
    setHasNextPage(data.hasNextPage);
    setPage(nextPage);
    setLoadingMore(false);
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          type="text"
          placeholder="Search anime by title…"
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

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted">No anime found for &quot;{query}&quot;.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
