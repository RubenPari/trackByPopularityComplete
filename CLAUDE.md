# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Spotify playlist management app that organizes a user's saved tracks into playlists by popularity range, artist grouping, and minor-artist detection, with playlist-state backup/restore. Two projects in one repo: a .NET backend API and a Vue frontend.

- **`tracksByPopularity/`** — ASP.NET Core Web API (.NET 10, C#), multi-project solution: `tracksByPopularity.sln`
- **`tracksByPopularityFront/`** — Vue 3 + TypeScript SPA (Vite, Pinia, Vue Router)
- MySQL/MariaDB for application data (EF Core migrations), Redis/Valkey for Spotify tokens and caching.

## Common Commands

### Backend (`tracksByPopularity/`)

```bash
cd tracksByPopularity
dotnet build
dotnet run                    # http://localhost:8080
dotnet watch run              # Hot reload
dotnet test tracksByPopularity.sln
dotnet test --filter "FullyQualifiedName~TestClassName"
dotnet format
```

### Frontend (`tracksByPopularityFront/`)

```bash
cd tracksByPopularityFront
npm ci
npm run dev                   # Vite dev server on http://localhost:5173
npm run build                 # Type-check + production build
npm run build-only            # Vite build without type-check
npm run type-check            # vue-tsc type checking
npm run lint                  # ESLint with auto-fix
npm run format                # Prettier
npm run test:unit             # Vitest (append `-- --run path/to.spec.ts` for a single file)
npm run test:e2e              # Playwright
```

### Full local stack

`docker-compose.yml` runs MariaDB, Redis, the backend, and the nginx-hosted frontend together (local dev only — production deploy does not use it):

```bash
CLIENT_ID=... CLIENT_SECRET=... REDIRECT_URI=http://localhost:8080 FRONTEND_ORIGIN=http://localhost \
  docker compose up --build
```

## Architecture

### Backend — Clean Architecture, one csproj per layer

The solution is split into separate projects (not folders under a single `src/`): `Domain/`, `Application/`, `Infrastructure/`, `Presentation/`, each with its own `.csproj`, plus `tests/tracksByPopularity.Tests/`.

- **Domain** — Entities (`Track`, `Playlist`), value objects (`PopularityRange`), enums, domain services (`TrackCategorizationService`)
- **Application** (`Services/`, `Interfaces/`, `DTOs/`, `Validators/`, `Mapping/`, `DependencyInjection/`) — `TrackOrganizationService`, `ArtistTrackOrganizationService`, `PlaylistOrganizationService`, `PlaylistService`, `TrackService`, `PlaylistHelperService`, `ArtistLibraryService`; FluentValidation validators; Mapperly mappers
- **Infrastructure** (`Services/`, `Data/`, `Migrations/`, `Background/`, `HealthChecks/`, `DependencyInjection/`) — `SpotifyAuthService`, `SpotifyPlaylistGateway`, `PlaylistBackupService`, Redis-backed cache services (`TrackCacheService`, `PlaylistCacheService`, `ArtistCacheService`, `RedisCacheRepository`, `CacheServiceBase`), EF Core `Migrations/` for the MySQL store
- **Presentation** (`Controllers/`, `Middlewares/`) — `AuthController`, `PlaylistController`, `TrackController`, `BackupController`; global exception handling middleware

### API Routes

All routes are under `/api` (no legacy dual-routing):

- `GET /api/health`
- `GET /api/auth/login`, `GET /api/auth/callback`, `GET /api/auth/is-auth`, `POST /api/auth/logout`
- `GET /api/playlist/all`, `POST /api/playlist/refresh`
- `POST /api/track/popularity/{range}`, `GET /api/track/artists`, `POST /api/track/artist?artistId=...`
- `GET /api/backup/list`, `POST /api/backup/restore/{snapshotId}`, `DELETE /api/backup/{snapshotId}`

Auth flow: `GET /api/auth/login` returns a `loginUrl`; Spotify redirects to `GET /api/auth/callback`, which stores the token in Redis/Valkey, sets an `HttpOnly`/`Secure`/`SameSite=Lax` `spotify_user_id` cookie, and redirects to the SPA's `/auth/callback` route.

### Frontend

- **Composables** (`src/composables/`) — `usePlaylists`, `usePlaylistActions`, `useFormValidation`, `useApiHealth` — encapsulate API interaction and state logic
- **Services** (`src/services/`) — `authApi`, `playlistApi` + shared `httpClient` — typed Axios API clients
- **State** — Pinia stores in `src/stores/`
- Vite proxies `/api`, `/auth`, `/health` to the backend (`VITE_API_BASE_URL`, default `http://localhost:8080`); an empty value uses the dev proxy, and DigitalOcean builds with the literal `same-origin`.

## Environment Variables

Root `.env` (backend, via `dotenv.net`): `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI` (base origin only — backend appends `/api/auth/callback`), `FRONTEND_ORIGIN`, `DATABASE_CONNECTION_STRING` (MySQL/MariaDB), `MIGRATE_ON_STARTUP`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USE_SSL`.

Frontend `.env.local`: `VITE_API_BASE_URL`.

## Deployment

Production runs on DigitalOcean App Platform (`.do/app.yaml`, single `fra`/`ams` region, same-origin backend + static frontend, managed MySQL + Valkey clusters). `.github/workflows/deploy-digitalocean.yml` is the only deploy driver — it runs backend tests and a production frontend build before updating the app; do not enable App Platform's separate deploy-on-push. See `README.md` for the full first-deployment runbook (cluster provisioning, GitHub secrets, Spotify callback registration, rollback via redeploying a known-good App Platform deployment).

## Key Libraries

- **Backend**: SpotifyAPI.Web (Spotify client), Entity Framework Core (MySQL), StackExchange.Redis, FluentValidation, Riok.Mapperly, Serilog, xUnit
- **Frontend**: Vue 3, Pinia, Vue Router, Axios, Vitest, Playwright

## Conventions

### Backend (C#)
- File-scoped namespaces matching folder structure; one public class per file; interface + implementation live together under `Interfaces/`/`Services/`
- Primary constructors for DI: `public class Service(IDependency dep) { }`
- Async methods end in `Async`; avoid `.Result`/`.Wait()`
- Structured logging via Serilog (`logger.LogInformation("Message {Param}", value)`); domain exceptions for business rule violations; global exception middleware handles the rest
- Responses wrap in `ApiResponse<T>` (`ApiResponse<T>.Ok(data)` / `ApiResponse.Fail("message")`)

### Frontend (TypeScript/Vue)
- `<script setup lang="ts">` everywhere; composables prefixed `use`; files in `kebab-case`, components in `PascalCase`
- `interface` for object shapes, `type` for unions/intersections; no `any` — use `unknown`
- Async calls wrapped in try/catch, surfaced via `NotificationBanner`; Prettier config: no semicolons, single quotes, 100-char width
