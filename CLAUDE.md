# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Spotify playlist management app that organizes user tracks into playlists based on popularity ranges, artist groupings, audio features (mood), and minor-artist detection. Two separate projects in one repo: a .NET backend API and a Vue frontend.

## Repository Structure

- **`tracksByPopularity/`** — ASP.NET Core Web API (.NET 10, C#), solution file: `tracksByPopularity.sln`
- **`tracksByPopularityFront/`** — Vue 3 + TypeScript SPA (Vite, Pinia, Vue Router)

## Common Commands

### Backend (`tracksByPopularity/`)

```bash
cd tracksByPopularity
dotnet build
dotnet run                    # Runs on http://localhost:8080
dotnet watch run              # Hot reload
```

### Frontend (`tracksByPopularityFront/`)

```bash
cd tracksByPopularityFront
npm install
npm run dev                   # Vite dev server on http://localhost:5173
npm run build                 # Type-check + production build
npm run build-only            # Vite build without type-check
npm run type-check            # vue-tsc type checking
npm run lint                  # ESLint with auto-fix
npm run format                # Prettier
npm run test:unit             # Vitest
npm run test:e2e              # Playwright
```

## Architecture

### Backend — Clean Architecture layers

- **Domain** (`src/Domain/`) — Entities (`Track`, `Playlist`), value objects (`PopularityRange`), enums (`MoodCategory`, `TimeRangeEnum`), domain services (`TrackCategorizationService`, `TrackMoodAnalyzerService`)
- **Application** (`src/Application/`) — Interfaces, DTOs, services, validators (FluentValidation), Mapperly mappers
- **Infrastructure** (`src/Infrastructure/`) — Spotify auth (`SpotifyAuthService`), Redis caching (`CacheService`), configuration, Serilog logging, background services (`RedisCacheResetService`)
- **Presentation** (`src/Presentation/`) — ASP.NET controllers, middleware (global exception handling, redirect)

### Key Backend Services

- **TrackOrganizationService** — Sorts user's saved tracks into playlists by popularity range (less/less-medium/medium/more-medium/more)
- **ArtistTrackOrganizationService** — Creates per-artist playlists split by popularity tiers
- **MinorSongsPlaylistService** — Builds a playlist of tracks from artists with ≤5 songs in the user's library
- **AudioFeaturesPlaylistService** — Organizes tracks by mood using Spotify audio features
- **CacheService** — Redis-backed cache for user tracks to avoid repeated Spotify API calls

### API Routes

Controllers expose dual routes for backward compatibility (e.g., both `/api/track` and `/track`):
- `POST /api/track/popularity/{range}` — Organize tracks by popularity range
- `POST /api/track/artist` — Organize artist tracks by popularity
- `GET /api/playlist/all` — List user playlists
- `POST /api/playlist/create-playlist-track-minor` — Create minor-songs playlist
- `/api/audio-features/` — Audio features/mood-based operations
- `/auth/login`, `/auth/callback`, `/auth/is-auth` — Spotify OAuth flow
- `GET /health` — Health check

### Frontend

- **Composables** (`src/composables/`) — `usePlaylists`, `usePlaylistActions`, `useFormValidation`, `useApiHealth` — encapsulate API interaction and state logic
- **Services** (`src/services/`) — `authApi`, `playlistApi` + shared `httpClient` — typed API clients using Axios
- **Components** — `PlaylistSelector`, `PlaylistActions`, `TrackActions`, `ArtistForm`, `AudioFeaturesActions`, `ActionButton`, `NotificationBanner`, `ErrorBoundary`
- **State** — Pinia stores in `src/stores/`
- Vite proxies `/api`, `/track`, `/playlist`, `/auth`, `/health` to the backend (default `http://localhost:8080`)

## Environment Variables

Backend reads from `.env` (via `dotenv.net`): `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `PLAYLIST_ID_LESS`, `PLAYLIST_ID_LESS_MEDIUM`, `PLAYLIST_ID_MEDIUM`, `PLAYLIST_ID_MORE_MEDIUM`, `PLAYLIST_ID_MORE`, `PLAYLIST_ID_TOP_SHORT`, `PLAYLIST_ID_TOP_MEDIUM`, `PLAYLIST_ID_TOP_LONG`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USE_SSL`.

Frontend uses `VITE_API_BASE_URL` (defaults to `http://localhost:8080`).

## Key Libraries

- **Backend**: SpotifyAPI.Web (Spotify client), StackExchange.Redis, FluentValidation, Riok.Mapperly, Serilog
- **Frontend**: Vue 3, Pinia, Vue Router, Axios, Vitest, Playwright
