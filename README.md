# AniScreener

Upload a picture of an anime character and find out which anime it's from. Free, instant, no sign-up. Also browse and search anime directly, with details on genres, episodes, cast, and more.

## How it works

**Identify**
1. The image is normalized server-side (`sharp`) into a clean JPEG.
2. It's sent to the [WD Tagger](https://huggingface.co/spaces/SmilingWolf/wd-tagger) Hugging Face Space, which tags the character.
3. The recognized character name is resolved to its anime via the [AniList](https://anilist.co) GraphQL API.

**Browse**

Search and pagination query AniList directly from the browser. Anime pages (`/anime/[id]`) are server-rendered from the same API.

No API keys are required to run this locally — both services are called anonymously. An optional `HF_TOKEN` env var (a Hugging Face access token) can be set to raise the Space's rate limits.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS
