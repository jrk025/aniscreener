"use client";

import { useEffect, useState } from "react";
import { dismissBackupReminder, downloadBackup, shouldShowBackupReminder } from "@/lib/backup";
import { onFavoritesChange } from "@/lib/favorites";
import { onWatchListChange } from "@/lib/watchStatus";
import { XIcon } from "@/components/icons";

export default function BackupReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(shouldShowBackupReminder());
    check();
    const unsubscribeFavorites = onFavoritesChange(check);
    const unsubscribeWatchList = onWatchListChange(check);
    return () => {
      unsubscribeFavorites();
      unsubscribeWatchList();
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-surface px-4 py-3">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">
          Your favorites and list only live in this browser. Nothing is saved on our servers. Download a
          backup so clearing your browser data doesn&apos;t lose them.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              downloadBackup();
              setVisible(false);
            }}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background"
          >
            Download backup
          </button>
          <button
            type="button"
            onClick={() => {
              dismissBackupReminder();
              setVisible(false);
            }}
            aria-label="Dismiss"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
