import type { Metadata } from "next";
import WatchList from "@/components/WatchList";

export const metadata: Metadata = {
  title: "My List | AniScreener",
  description: "Anime you're watching, planning to watch, or have finished, saved in your browser.",
};

export default function ListPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">My list</h1>
      <p className="mt-1 text-muted">
        Track what you are watching, planning to watch, or have finished. Saved only in this browser.
      </p>
      <WatchList />
    </div>
  );
}
