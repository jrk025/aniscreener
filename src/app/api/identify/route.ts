import { NextResponse } from "next/server";
import { tagImage } from "@/lib/tagger";
import { normalizeImage, UnsupportedImageError } from "@/lib/image";
import { findAnimeBySeriesHint, findCharacterAnime } from "@/lib/anilist";
import { cleanCharacterName, extractSeriesHint } from "@/lib/characterName";
import { checkDailyLimit, getClientIp } from "@/lib/ratelimit";
import type { IdentifyResponse } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MATCH_THRESHOLD = 0.65;

export async function POST(request: Request): Promise<NextResponse<IdentifyResponse>> {
  const withinLimit = await checkDailyLimit(getClientIp(request));
  if (!withinLimit) {
    return NextResponse.json(
      { status: "error", message: "Daily identification limit reached. Please try again tomorrow." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ status: "error", message: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ status: "error", message: "No image was uploaded." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ status: "error", message: "Only image files are supported." }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ status: "error", message: "Image is larger than 10MB." }, { status: 400 });
  }

  let normalized: Buffer;
  try {
    normalized = await normalizeImage(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof UnsupportedImageError) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 400 });
    }
    throw error;
  }

  try {
    const { characterTags, generalTags } = await tagImage({
      buffer: normalized,
      filename: "image.jpg",
      mimeType: "image/jpeg",
    });

    if (characterTags.length === 0) {
      return NextResponse.json({
        status: "unmatched",
        tags: generalTags.slice(0, 12).map((t) => t.label),
      });
    }

    // Try candidates by confidence until one resolves to a real anime.
    for (const tag of characterTags) {
      const cleanName = cleanCharacterName(tag.label);
      const seriesHint = extractSeriesHint(tag.label);

      const character = await findCharacterAnime(cleanName);
      let anime = character?.anime ?? [];

      if (anime.length === 0 && seriesHint) {
        const bySeries = await findAnimeBySeriesHint(seriesHint);
        if (bySeries) anime = [bySeries];
      }

      if (anime.length > 0) {
        return NextResponse.json({
          status: tag.confidence >= MATCH_THRESHOLD ? "matched" : "uncertain",
          confidence: Math.round(tag.confidence * 100),
          character: {
            name: character?.name ?? cleanName,
            rawTag: tag.label,
            image: character?.image,
          },
          anime,
        });
      }
    }

    return NextResponse.json({
      status: "no_anime_found",
      confidence: Math.round(characterTags[0].confidence * 100),
      character: { name: cleanCharacterName(characterTags[0].label), rawTag: characterTags[0].label },
    });
  } catch (error) {
    console.error("identify failed:", error);
    return NextResponse.json(
      { status: "error", message: "The recognition service is unavailable right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
