"use client";

import { useSyncExternalStore } from "react";
import type { AnimeSummary } from "@/lib/anilist";
import { getStatus, onWatchListChange, removeStatus, setStatus, type WatchStatus } from "@/lib/watchStatus";

const OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
];

export default function WatchStatusPicker({ anime }: { anime: AnimeSummary }) {
  const current = useSyncExternalStore(
    onWatchListChange,
    () => getStatus(anime.id),
    () => null
  );

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => (current === option.value ? removeStatus(anime.id) : setStatus(anime, option.value))}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            current === option.value
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
