import { stripHtml } from "@/lib/text";

const ANILIST_URL = "https://graphql.anilist.co";
const REQUEST_TIMEOUT_MS = 15_000;

export interface AnimeSummary {
  id: number;
  title: string;
  titleNative?: string;
  coverImage?: string;
  color?: string;
  format?: string;
  year?: number;
  score?: number;
  genres: string[];
  status?: string;
}

export interface AnimeCharacter {
  id: number;
  name: string;
  image?: string;
  role: string;
}

export interface AnimeDetail extends AnimeSummary {
  description?: string;
  bannerImage?: string;
  episodes?: number;
  duration?: number;
  season?: string;
  studios: string[];
  characters: AnimeCharacter[];
  siteUrl: string;
}

export interface CharacterMatch {
  name: string;
  image?: string;
  anime: AnimeSummary[];
}

interface AniListMediaNode {
  id: number;
  title: { romaji?: string; english?: string };
  coverImage?: { large?: string; extraLarge?: string; color?: string };
  bannerImage?: string;
  startDate?: { year?: number };
  season?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  genres?: string[];
  description?: string;
  studios?: { nodes: { name: string }[] };
  characters?: { edges: { role: string; node: { id: number; name: { full: string }; image?: { large?: string } } }[] };
  siteUrl: string;
}

async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data as T | undefined) ?? null;
}

function toSummary(node: AniListMediaNode): AnimeSummary {
  return {
    id: node.id,
    title: node.title.english || node.title.romaji || "Unknown title",
    titleNative: node.title.romaji,
    coverImage: node.coverImage?.extraLarge || node.coverImage?.large,
    color: node.coverImage?.color,
    format: node.format,
    year: node.startDate?.year,
    score: node.averageScore,
    genres: node.genres ?? [],
    status: node.status,
  };
}

function toDetail(node: AniListMediaNode): AnimeDetail {
  return {
    ...toSummary(node),
    description: node.description ? stripHtml(node.description) : undefined,
    bannerImage: node.bannerImage,
    episodes: node.episodes,
    duration: node.duration,
    season: node.season,
    studios: node.studios?.nodes.map((s) => s.name) ?? [],
    characters:
      node.characters?.edges.map((edge) => ({
        id: edge.node.id,
        name: edge.node.name.full,
        image: edge.node.image?.large,
        role: edge.role,
      })) ?? [],
    siteUrl: node.siteUrl,
  };
}

const SUMMARY_FIELDS = `
  id
  title { romaji english }
  coverImage { large extraLarge color }
  format
  status
  startDate { year }
  averageScore
  genres
`;

const CHARACTER_QUERY = `
query ($search: String) {
  Character(search: $search) {
    name { full }
    image { large }
    media(sort: POPULARITY_DESC, perPage: 3, type: ANIME) {
      nodes { ${SUMMARY_FIELDS} siteUrl }
    }
  }
}`;

export async function findCharacterAnime(name: string): Promise<CharacterMatch | null> {
  const data = await queryAniList<{
    Character: {
      name: { full: string };
      image?: { large?: string };
      media: { nodes: AniListMediaNode[] };
    } | null;
  }>(CHARACTER_QUERY, { search: name });

  const character = data?.Character;
  if (!character) return null;

  return {
    name: character.name.full,
    image: character.image?.large,
    anime: character.media.nodes.map(toSummary),
  };
}

const MEDIA_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    ${SUMMARY_FIELDS}
    siteUrl
  }
}`;

export async function findAnimeBySeriesHint(hint: string): Promise<AnimeSummary | null> {
  const data = await queryAniList<{ Media: AniListMediaNode | null }>(MEDIA_QUERY, {
    search: hint,
  });
  return data?.Media ? toSummary(data.Media) : null;
}

export interface AnimeListPage {
  results: AnimeSummary[];
  hasNextPage: boolean;
}

const BROWSE_QUERY = `
query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(type: ANIME, search: $search, sort: $sort) {
      ${SUMMARY_FIELDS}
    }
  }
}`;

export async function browseAnime(
  search: string,
  page: number = 1,
  perPage: number = 24
): Promise<AnimeListPage> {
  const data = await queryAniList<{
    Page: { pageInfo: { hasNextPage: boolean }; media: AniListMediaNode[] };
  }>(BROWSE_QUERY, {
    search: search || null,
    page,
    perPage,
    sort: search ? ["SEARCH_MATCH"] : ["POPULARITY_DESC"],
  });

  if (!data) return { results: [], hasNextPage: false };
  return {
    results: data.Page.media.map(toSummary),
    hasNextPage: data.Page.pageInfo.hasNextPage,
  };
}

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    ${SUMMARY_FIELDS}
    description(asHtml: false)
    bannerImage
    episodes
    duration
    season
    studios(isMain: true) { nodes { name } }
    characters(sort: [ROLE, RELEVANCE], perPage: 12) {
      edges { role node { id name { full } image { large } } }
    }
    siteUrl
  }
}`;

export async function getAnimeById(id: number): Promise<AnimeDetail | null> {
  const data = await queryAniList<{ Media: AniListMediaNode | null }>(DETAIL_QUERY, { id });
  return data?.Media ? toDetail(data.Media) : null;
}
