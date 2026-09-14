import type { AnimeSummary } from "@/lib/anilist";

export type IdentifyResponse =
  | {
      status: "matched";
      confidence: number;
      character: { name: string; rawTag: string; image?: string };
      anime: AnimeSummary[];
    }
  | {
      status: "uncertain";
      confidence: number;
      character: { name: string; rawTag: string; image?: string };
      anime: AnimeSummary[];
    }
  | {
      status: "no_anime_found";
      confidence: number;
      character: { name: string; rawTag: string };
    }
  | {
      status: "unmatched";
      tags: string[];
    }
  | {
      status: "error";
      message: string;
    };
