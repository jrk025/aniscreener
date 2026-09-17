import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnimeById } from "@/lib/anilist";
import { titleCaseFromEnum } from "@/lib/text";
import { ArrowLeftIcon, ExternalLinkIcon, SparkleIcon } from "@/components/icons";
import FavoriteButton from "@/components/FavoriteButton";
import WatchStatusPicker from "@/components/WatchStatusPicker";

export const revalidate = 3600;

async function loadAnime(id: string) {
  const animeId = Number(id);
  if (!Number.isInteger(animeId)) return null;
  return getAnimeById(animeId);
}

export async function generateMetadata(props: PageProps<"/anime/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const anime = await loadAnime(id);
  return {
    title: anime ? `${anime.title} | AniScreener` : "Anime not found | AniScreener",
    description: anime?.description?.slice(0, 160),
  };
}

const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

export default async function AnimeDetailPage(props: PageProps<"/anime/[id]">) {
  const { id } = await props.params;
  const anime = await loadAnime(id);
  if (!anime) notFound();

  const meta = [
    anime.format,
    anime.episodes ? `${anime.episodes} episodes` : null,
    anime.duration ? `${anime.duration} min` : null,
    anime.status ? STATUS_LABELS[anime.status] ?? titleCaseFromEnum(anime.status) : null,
    anime.year,
    anime.studios[0],
  ].filter(Boolean);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to browse
        </Link>
      </div>

      {anime.bannerImage && (
        <div className="mx-auto mt-4 w-full max-w-5xl px-4">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={anime.bannerImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
          </div>
        </div>
      )}

      <div className="mx-auto mt-6 w-full max-w-5xl px-4">
        <div className="flex flex-col gap-6 sm:flex-row">
          {anime.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="h-64 w-44 shrink-0 rounded-xl object-cover shadow-lg"
            />
          ) : null}

          <div className="min-w-0 flex-1 pt-2">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{anime.title}</h1>
              <FavoriteButton
                anime={anime}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:text-accent"
                iconClassName="h-4 w-4"
              />
            </div>
            {anime.titleNative && <p className="mt-1 text-muted">{anime.titleNative}</p>}

            <p className="mt-3 text-sm text-muted">{meta.join(" · ")}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {typeof anime.score === "number" && (
                <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-sm">
                  <SparkleIcon className="h-3.5 w-3.5 text-accent" />
                  {anime.score}%
                </span>
              )}
              {anime.genres.map((genre) => (
                <span key={genre} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                  {genre}
                </span>
              ))}
            </div>

            <a
              href={anime.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
            >
              View on AniList
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>

            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">Your status</p>
              <WatchStatusPicker anime={anime} />
            </div>
          </div>
        </div>

        {anime.description && (
          <p className="mt-8 max-w-3xl whitespace-pre-line leading-relaxed text-foreground/90">
            {anime.description}
          </p>
        )}

        {anime.characters.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Characters</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {anime.characters.map((character) => (
                <div
                  key={character.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5"
                >
                  {character.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={character.image}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-full bg-border" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{character.name}</p>
                    <p className="text-xs text-muted">{character.role === "MAIN" ? "Main" : "Supporting"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {anime.relations.length > 0 && (
          <div className="mt-10 mb-12">
            <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">Related</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {anime.relations.slice(0, 8).map((relation) => (
                <Link
                  key={relation.id}
                  href={`/anime/${relation.id}`}
                  className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50"
                >
                  {relation.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={relation.coverImage}
                      alt=""
                      loading="lazy"
                      className="h-32 w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-full bg-border" />
                  )}
                  <div className="p-2.5">
                    <p className="truncate text-xs uppercase tracking-wide text-muted">
                      {titleCaseFromEnum(relation.relationType)}
                    </p>
                    <p className="truncate text-sm font-medium group-hover:text-accent">{relation.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
