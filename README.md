## Tracks by Popularity (Spotify Playlist Manager)

An app to organize your Spotify library into playlists automatically:

- **by popularity ranges** (`less` / `less-medium` / `medium` / `more-medium` / `more`)
- **by artist** (artist-specific playlists split by popularity tiers)
- **(optional/extensible)** by audio features / mood and “minor artist” detection

This repo contains **two projects**:

- `tracksByPopularity/`: **ASP.NET Core Web API** (.NET 10)
- `tracksByPopularityFront/`: **Vue 3 + TypeScript** (Vite)

## Architecture (backend)

The backend follows Clean Architecture:

- `src/Domain/`: entities/value objects/domain rules
- `src/Application/`: DTOs, application services, interfaces, validation, mapping
- `src/Infrastructure/`: external integrations (Spotify, Redis, logging, etc.)
- `src/Presentation/`: controllers, middleware, filters

## Prerequisites

- **Spotify Developer App** (Client ID/Secret and Redirect URI configured)
- **.NET SDK 10**
- **Node.js**: `^20.19.0` or `>=22.12.0` (see `tracksByPopularityFront/package.json`)
- **Docker** (optional, for a full stack start with DB/Redis)

## Backend `.env` configuration

Copy the template from the repo root:

```bash
cp .env.example .env
```

Main variables (see `.env.example`):

- **Spotify OAuth**
  - `CLIENT_ID`
  - `CLIENT_SECRET`
  - `REDIRECT_URI` (e.g. `http://127.0.0.1:8080/auth/callback`)
- **Database**
  - `DATABASE_CONNECTION_STRING`
- **Redis**
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USE_SSL`
- **Frontend/Client**
  - `CLIENT_URL` (typically `http://localhost:5173`)

Note: if you run Docker Compose, some values are provided/overridden by `docker-compose.yml` (e.g. mysql/redis hosts).

## Frontend configuration

Copy the template:

```bash
cp tracksByPopularityFront/.env.example tracksByPopularityFront/.env
```

Variable:

- `VITE_API_BASE_URL` (default `http://localhost:8080`)

## Quick start (Docker Compose)

Start **MariaDB** + **Redis** + **Backend** + **Frontend**:

```bash
docker compose up --build
```

Default ports:

- **Frontend**: `http://localhost/` (port 80)
- **Backend API**: `http://localhost:8080/`
- **Redis**: `localhost:6379`
- **MariaDB**: `localhost:3306`

## Local development (recommended)

### Backend

```bash
cd tracksByPopularity
dotnet build
dotnet run
```

Backend runs on `http://localhost:8080`.

### Frontend

```bash
cd tracksByPopularityFront
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite proxies `/api`, `/auth`, `/track`, `/playlist`, `/health` to the backend).

## Spotify authentication flow

- Start backend + frontend
- From the frontend (or directly), call `GET /auth/login` and read `loginUrl`
- Complete Spotify login
- Callback hits `GET /auth/callback`
- Backend stores tokens in Redis and sets a `spotify_user_id` HttpOnly cookie
- Check session via `GET /auth/is-auth`

## Main API endpoints

Backend base URL: `http://localhost:8080`

### Health

- `GET /health`

### Auth

- `GET /auth/login`
- `GET /auth/callback`
- `GET /auth/is-auth`
- `POST /auth/logout`

### Playlist

- `GET /api/playlist/all` (requires Spotify auth)
- `POST /api/playlist/refresh` (requires Spotify auth)

### Track

- `POST /api/track/popularity/{range}` (requires Spotify auth)  
  `range` ∈ `less` | `less-medium` | `medium` | `more-medium` | `more`
- `GET /api/track/artists` (requires Spotify auth)
- `POST /api/track/artist?artistId=...` (requires Spotify auth)

## Testing & quality

### Frontend

```bash
cd tracksByPopularityFront
npm run lint
npm run type-check
npm run test:unit
```

### Backend

```bash
cd tracksByPopularity
dotnet test
```

## Useful notes

- **Secrets**: don’t commit `.env`. Use `.env.example` as a template.
- **Redis**: used for caching (Spotify tokens + data to reduce Spotify API calls).
- **DB**: `docker-compose.yml` includes MariaDB; in local dev you can run it via Docker.

---

## Tracks by Popularity (Spotify Playlist Manager) — Italiano

App per gestire e organizzare la tua libreria Spotify in playlist automaticamente:

- **per fasce di popolarità** (`less` / `less-medium` / `medium` / `more-medium` / `more`)
- **per artista** (playlist dedicate per artista con tier di popolarità)
- **(opzionale/estendibile)** per audio features / mood e rilevamento “minor artist”

Il repo contiene **due progetti**:

- `tracksByPopularity/`: **ASP.NET Core Web API** (.NET 10)
- `tracksByPopularityFront/`: **Vue 3 + TypeScript** (Vite)

## Architettura (backend)

Il backend segue una struttura “Clean Architecture”:

- `src/Domain/`: entità/valori/regole di dominio
- `src/Application/`: DTO, servizi applicativi, interfacce, validazione, mapping
- `src/Infrastructure/`: integrazioni esterne (Spotify, Redis, logging, ecc.)
- `src/Presentation/`: controller, middleware, filtri

## Prerequisiti

- **Spotify Developer App** (Client ID/Secret e Redirect URI configurati)
- **.NET SDK 10**
- **Node.js**: `^20.19.0` oppure `>=22.12.0` (vedi `tracksByPopularityFront/package.json`)
- **Docker** (opzionale, per avvio “all-in-one” con DB/Redis)

## Configurazione `.env` (backend)

Nel root del repo trovi un esempio:

```bash
cp .env.example .env
```

Variabili principali (vedi `.env.example`):

- **Spotify OAuth**
  - `CLIENT_ID`
  - `CLIENT_SECRET`
  - `REDIRECT_URI` (es. `http://127.0.0.1:8080/auth/callback`)
- **Database**
  - `DATABASE_CONNECTION_STRING`
- **Redis**
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USE_SSL`
- **Frontend/Client**
  - `CLIENT_URL` (tipicamente `http://localhost:5173`)

Nota: se usi Docker Compose, alcune variabili vengono sovrascritte/fornite dal compose (es. host redis/mysql).

## Configurazione frontend

Nel frontend trovi un esempio:

```bash
cp tracksByPopularityFront/.env.example tracksByPopularityFront/.env
```

Variabile:

- `VITE_API_BASE_URL` (default `http://localhost:8080`)

## Avvio rapido (Docker Compose)

Avvia **DB (MariaDB)** + **Redis** + **Backend** + **Frontend**:

```bash
docker compose up --build
```

Servizi/porte (default):

- **Frontend**: `http://localhost/` (porta 80)
- **Backend API**: `http://localhost:8080/`
- **Redis**: `localhost:6379`
- **MariaDB**: `localhost:3306`

## Sviluppo locale (consigliato)

### Backend

```bash
cd tracksByPopularity
dotnet build
dotnet run
```

Backend su `http://localhost:8080`.

### Frontend

```bash
cd tracksByPopularityFront
npm install
npm run dev
```

Frontend su `http://localhost:5173` (Vite fa proxy verso il backend per `/api`, `/auth`, `/track`, `/playlist`, `/health`).

## Autenticazione Spotify (flow)

- Avvia backend+frontend
- Dal frontend (o direttamente) chiama `GET /auth/login` e leggi `loginUrl`
- Completa login su Spotify
- Callback su `GET /auth/callback`
- Il backend salva token in Redis e imposta un cookie `spotify_user_id` (HttpOnly)
- Verifica sessione con `GET /auth/is-auth`

## Endpoint API principali

Backend base URL: `http://localhost:8080`

### Health

- `GET /health`

### Auth

- `GET /auth/login`
- `GET /auth/callback`
- `GET /auth/is-auth`
- `POST /auth/logout`

### Playlist

- `GET /api/playlist/all` (richiede auth Spotify)
- `POST /api/playlist/refresh` (richiede auth Spotify)

### Track

- `POST /api/track/popularity/{range}` (richiede auth Spotify)  
  `range` ∈ `less` | `less-medium` | `medium` | `more-medium` | `more`
- `GET /api/track/artists` (richiede auth Spotify)
- `POST /api/track/artist?artistId=...` (richiede auth Spotify)

## Testing & qualità

### Frontend

```bash
cd tracksByPopularityFront
npm run lint
npm run type-check
npm run test:unit
```

### Backend

```bash
cd tracksByPopularity
dotnet test
```

## Note utili

- **Segreti**: non committare `.env`. Usa `.env.example` come template.
- **Redis**: usato per caching (token Spotify e dati per ridurre chiamate alle API Spotify).
- **DB**: nel `docker-compose.yml` è presente MariaDB; in dev locale puoi usare la stessa tramite Docker.
