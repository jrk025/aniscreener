"use client";

import { useSyncExternalStore } from "react";
import type { AnimeSummary } from "@/lib/anilist";
import { isFavorite, onFavoritesChange, toggleFavorite } from "@/lib/favorites";
import { HeartIcon } from "@/components/icons";

export default function FavoriteButton({
  anime,
  className,
  iconClassName,
}: {
  anime: AnimeSummary;
  className?: string;
  iconClassName?: string;
}) {
  const favorite = useSyncExternalStore(
    onFavoritesChange,
    () => isFavorite(anime.id),
    () => false
  );

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(anime);
      }}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorite}
      className={className}
    >
      <HeartIcon filled={favorite} className={iconClassName} />
    </button>
  );
}
