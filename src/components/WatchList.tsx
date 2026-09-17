"use client";

import { useSyncExternalStore } from "react";
import AnimeCard from "@/components/AnimeCard";
import {
  getWatchList,
  getWatchListServerSnapshot,
  onWatchListChange,
  type WatchStatus,
} from "@/lib/watchStatus";

const SECTIONS: { value: WatchStatus; label: string }[] = [
  { value: "watching", label: "Watching" },
  { value: "plan_to_watch", label: "Plan to Watch" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
];

export default function WatchList() {
  const entries = useSyncExternalStore(onWatchListChange, getWatchList, getWatchListServerSnapshot);

  if (entries.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted">
        Your list is empty. Open any anime page and set a status to add it here.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {SECTIONS.map((section) => {
        const items = entries.filter((entry) => entry.status === section.value);
        if (items.length === 0) return null;
        return (
          <div key={section.value}>
            <h2 className="mb-3 text-xs uppercase tracking-wide text-muted">
              {section.label} ({items.length})
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((entry) => (
                <AnimeCard key={entry.anime.id} anime={entry.anime} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
