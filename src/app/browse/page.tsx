import type { Metadata } from "next";
import AnimeBrowser from "@/components/AnimeBrowser";

export const metadata: Metadata = {
  title: "Browse anime | AniScreener",
  description: "Search and explore anime, with details on genres, episodes, and cast.",
};

export default function BrowsePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Browse anime</h1>
      <p className="mt-1 text-muted">Search thousands of anime or explore what&apos;s popular right now.</p>
      <AnimeBrowser />
    </div>
  );
}
