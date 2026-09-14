import Link from "next/link";
import type { AnimeSummary } from "@/lib/anilist";
import { SparkleIcon } from "@/components/icons";

export default function AnimeCard({ anime }: { anime: AnimeSummary }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="group flex gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/50"
    >
      {anime.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={anime.coverImage}
          alt=""
          className="h-24 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-24 w-16 shrink-0 rounded-lg bg-border" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium group-hover:text-accent">{anime.title}</p>
        <p className="mt-0.5 text-sm text-muted">
          {[anime.format, anime.year].filter(Boolean).join(" · ")}
        </p>
        {typeof anime.score === "number" && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <SparkleIcon className="h-3.5 w-3.5 text-accent" />
            {anime.score}%
          </p>
        )}
        {anime.genres.length > 0 && (
          <p className="mt-1.5 truncate text-xs text-muted">{anime.genres.slice(0, 3).join(", ")}</p>
        )}
      </div>
    </Link>
  );
}
