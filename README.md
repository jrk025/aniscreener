# AniScreener

Upload a picture of an anime character and find out which anime it's from. Free, instant, no sign-up. Also browse and search anime directly, with details on genres, episodes, cast, and more.

## How it works

**Identify**
1. The image is normalized server-side (`sharp`) into a clean JPEG.
2. It's sent to the [WD Tagger](https://huggingface.co/spaces/SmilingWolf/wd-tagger) Hugging Face Space, which tags the character.
3. The recognized character name is resolved to its anime via the [AniList](https://anilist.co) GraphQL API.

**Browse**

Search and pagination query AniList directly from the browser. Anime pages (`/anime/[id]`) are server-rendered from the same API and cached for an hour. Every anime can be favorited and added to your list (Plan to Watch, Watching, Completed, On Hold, Dropped) from its page, viewable under My List.

No API keys are required to run this locally — both services are called anonymously. An optional `HF_TOKEN` env var (a Hugging Face access token) can be set to raise the Space's rate limits.

## Data & privacy

The server stores nothing about you or your usage — no accounts, no database, no logged searches, no saved images. Uploaded images are only held in memory long enough to be tagged, then discarded.

Favorites, your list, recent searches, and cached browse results live entirely in your own browser's local storage. Clearing your browser data removes them permanently and there is no way to recover them from the server, because they were never sent there. The Favorites tab on the Browse page has an **Export backup** button that downloads everything as a JSON file, and an **Import backup** button to restore it later or move it to another browser. The site will also occasionally suggest downloading a backup if you have favorites or list entries saved.

The one exception is abuse protection: the `/api/identify` endpoint enforces a daily per-IP request limit (optional, only active when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are configured). It stores a hashed IP address with a request count that automatically expires after 24 hours — no search history, favorites, or images are ever part of that record.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: rate limiting

To enable the daily identify-request limit, create a free [Upstash](https://upstash.com) Redis database and set:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Without these, the app runs normally with no limit.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS
