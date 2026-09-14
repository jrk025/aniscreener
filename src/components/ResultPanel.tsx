import type { IdentifyResponse } from "@/lib/types";
import AnimeCard from "@/components/AnimeCard";

function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-accent transition-all"
          style={{ width: `${confidence}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted">{confidence}%</span>
    </div>
  );
}

export default function ResultPanel({ result }: { result: IdentifyResponse }) {
  if (result.status === "matched" || result.status === "uncertain") {
    const isConfident = result.status === "matched";
    return (
      <section className="w-full space-y-5 rounded-2xl border border-border bg-surface/60 p-6">
        <div className="flex items-center gap-4">
          {result.character.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.character.image}
              alt={result.character.name}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-muted">
              {isConfident ? "Identified character" : "Possible match"}
            </p>
            <h2 className="truncate text-lg font-semibold">{result.character.name}</h2>
          </div>
        </div>

        <ConfidenceBar confidence={result.confidence} />

        {!isConfident && (
          <p className="text-sm text-muted">
            The model isn&apos;t fully certain about this one — take the result with a grain of salt.
          </p>
        )}

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">Appears in</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.anime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (result.status === "no_anime_found") {
    return (
      <section className="w-full space-y-2 rounded-2xl border border-border bg-surface/60 p-6">
        <p className="text-xs uppercase tracking-wide text-muted">Character recognized</p>
        <h2 className="text-lg font-semibold">{result.character.name}</h2>
        <p className="text-sm text-muted">
          We recognized this character but couldn&apos;t confidently match it to an anime. Try a clearer or
          closer-up image.
        </p>
      </section>
    );
  }

  if (result.status === "unmatched") {
    return (
      <section className="w-full space-y-3 rounded-2xl border border-border bg-surface/60 p-6">
        <p className="text-sm text-muted">
          We couldn&apos;t confidently recognize a known anime character in this image.
        </p>
        {result.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="w-full rounded-2xl border border-red-900/50 bg-red-950/20 p-6">
      <p className="text-sm text-red-300">{result.message}</p>
    </section>
  );
}
