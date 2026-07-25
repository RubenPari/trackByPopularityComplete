## Tracks by Popularity (Spotify Playlist Manager)

Tracks by Popularity organizes a Spotify library into playlists by track popularity, artist, and saved-library state. The repository contains:

- `tracksByPopularity/`: ASP.NET Core 10 backend using Clean Architecture;
- `tracksByPopularityFront/`: Vue 3, TypeScript, and Vite frontend;
- MariaDB/MySQL for application data;
- Redis/Valkey for Spotify tokens and cache data.

## Requirements

- Spotify Developer application with Client ID and Client Secret
- .NET SDK 10
- Node.js `20.19.0` or `>=22.12.0`
- Docker for the complete local stack
- For production: DigitalOcean, GitHub CLI, and `doctl`

## Local configuration

Copy the root environment template and provide Spotify credentials:

```bash
cp .env.example .env
```

`REDIRECT_URI` is the backend origin, not a callback path. The backend appends `/api/auth/callback`. `FRONTEND_ORIGIN` is the browser origin used after OAuth succeeds.

For the frontend:

```bash
cp tracksByPopularityFront/.env.example tracksByPopularityFront/.env.local
```

An empty `VITE_API_BASE_URL` uses the Vite development proxy. DigitalOcean supplies the build-time literal `same-origin`, which the frontend converts to an empty browser base URL.

## Local development

Docker Compose is for local development only. It starts MariaDB, Redis, the backend, and the nginx-hosted frontend:

```bash
CLIENT_ID=your-client-id \
CLIENT_SECRET=your-client-secret \
REDIRECT_URI=http://localhost:8080 \
FRONTEND_ORIGIN=http://localhost \
docker compose up --build
```

Local URLs:

- frontend: `http://localhost`
- backend: `http://localhost:8080`
- health: `http://localhost:8080/api/health`

To run each application directly:

```bash
cd tracksByPopularity
dotnet run
```

```bash
cd tracksByPopularityFront
npm ci
npm run dev
```

Vite serves the frontend at `http://localhost:5173` and proxies API requests to the backend.

## Spotify authentication and API routes

1. Request `GET /api/auth/login` and open the returned `loginUrl`.
2. Spotify redirects to `GET /api/auth/callback`.
3. The backend stores the Spotify token in Redis/Valkey, sets the `spotify_user_id` HttpOnly cookie, and redirects to the SPA route `/auth/callback`.
4. Check the session with `GET /api/auth/is-auth`; sign out with `POST /api/auth/logout`.

Primary routes:

- `GET /api/health`
- `GET /api/auth/login`
- `GET /api/auth/callback`
- `GET /api/auth/is-auth`
- `POST /api/auth/logout`
- `GET /api/playlist/all`
- `POST /api/playlist/refresh`
- `POST /api/track/popularity/{range}`
- `GET /api/track/artists`
- `POST /api/track/artist?artistId=...`

## DigitalOcean production deployment

`.do/app.yaml` declares a same-origin App Platform deployment in `fra`:

- one ASP.NET Core backend instance on port 8080;
- one static Vue/Vite site;
- an existing DigitalOcean Managed MySQL cluster;
- an existing DigitalOcean Managed Valkey cluster;
- `/api` ingress to the backend, then `/` to the static frontend;
- `${APP_URL}` for OAuth and frontend redirects, including a future primary custom domain.

The workflow `.github/workflows/deploy-digitalocean.yml` is the only deployment driver. It runs backend tests and a production frontend build before updating the app. Do not enable App Platform deploy-on-push separately.

### First deployment — required order

1. Authenticate `doctl`, then verify currently available versions and sizes before provisioning:

   ```bash
   doctl auth init
   doctl databases options versions --engine mysql
   doctl databases options versions --engine valkey
   doctl databases options slugs --engine mysql
   doctl databases options slugs --engine valkey
   ```

2. Create both managed clusters in `fra1`, one 1 GiB node each. If the account does not offer both engines and sizes in `fra1`, use `ams` for the app and `ams3` for both databases; never split the resources between regions.

   ```bash
   doctl databases create tracks-popularity-mysql \
     --engine mysql --version 8.4 --region fra1 \
     --size db-s-1vcpu-1gb --num-nodes 1 --wait

   doctl databases create tracks-popularity-valkey \
     --engine valkey --version 8 --region fra1 \
     --size db-s-1vcpu-1gb --num-nodes 1 --wait
   ```

3. Create the application database and retain the managed `doadmin` user:

   ```bash
   MYSQL_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | awk '$2 == "tracks-popularity-mysql" { print $1 }')
   test -n "$MYSQL_CLUSTER_ID"
   doctl databases db create "$MYSQL_CLUSTER_ID" tracksbypopularity
   ```

4. Create GitHub repository secrets interactively. Never put their values in source files:

   ```bash
   gh secret set DIGITALOCEAN_ACCESS_TOKEN
   gh secret set SPOTIFY_CLIENT_ID
   gh secret set SPOTIFY_CLIENT_SECRET
   ```

5. Start the first deployment and wait for both `verify` and `deploy` jobs:

   ```bash
   gh workflow run deploy-digitalocean.yml --ref main
   gh run watch
   ```

   The workflow creates or updates the `tracks-popularity` app and links the clusters named `tracks-popularity-mysql` and `tracks-popularity-valkey`.

6. Read the generated `https://*.ondigitalocean.app` URL in App Platform. In the Spotify Developer Dashboard, register this exact callback:

   ```text
   ${APP_URL}/api/auth/callback
   ```

   If the primary origin changed, rerun `deploy-digitalocean.yml` so `${APP_URL}` is rebound throughout the deployment.

7. Verify the deployed application:

   ```bash
   curl -fsS "${APP_URL}/api/health"
   curl -fsS "${APP_URL}/api/auth/login"
   curl -fsS "${APP_URL}/auth/callback"
   ```

   Health must return `Healthy`. URL-decode `loginUrl` and confirm its `redirect_uri` is exactly `${APP_URL}/api/auth/callback`. The direct SPA callback route must return the frontend rather than 404. Complete a real Spotify login, then confirm the `spotify_user_id` cookie is `HttpOnly`, `Secure`, and `SameSite=Lax`, and that `GET ${APP_URL}/api/auth/is-auth` returns `authenticated: true` in the same session.

### Custom domain

Set the custom domain as primary in App Platform, update the Spotify callback to the new `${APP_URL}/api/auth/callback`, then redeploy. `FRONTEND_ORIGIN` and `REDIRECT_URI` follow `${APP_URL}`; no host is baked into the code.

### Rollback

Open the app's **Deployments** page in DigitalOcean App Platform and redeploy a known-good deployment. Database deletion is not a rollback: the managed MySQL and Valkey clusters must remain attached and preserve application state.

## Verification commands

```bash
dotnet test tracksByPopularity/tracksByPopularity.sln
docker build -f tracksByPopularity/Dockerfile -t tracks-popularity-backend tracksByPopularity
cd tracksByPopularityFront
npm ci
VITE_API_BASE_URL=same-origin npm run build
npm run test:unit -- --run src/__tests__/env.spec.ts
```

---

## Tracks by Popularity (Spotify Playlist Manager) — Italiano

Tracks by Popularity organizza la libreria Spotify in playlist in base a popolarità, artista e stato dei brani salvati. Il repository contiene:

- `tracksByPopularity/`: backend ASP.NET Core 10 con Clean Architecture;
- `tracksByPopularityFront/`: frontend Vue 3, TypeScript e Vite;
- MariaDB/MySQL per i dati applicativi;
- Redis/Valkey per token Spotify e cache.

## Requisiti

- Applicazione Spotify Developer con Client ID e Client Secret
- .NET SDK 10
- Node.js `20.19.0` oppure `>=22.12.0`
- Docker per lo stack locale completo
- Per la produzione: DigitalOcean, GitHub CLI e `doctl`

## Configurazione locale

Copia il template delle variabili root e inserisci le credenziali Spotify:

```bash
cp .env.example .env
```

`REDIRECT_URI` è l'origin del backend, non il percorso callback. Il backend aggiunge `/api/auth/callback`. `FRONTEND_ORIGIN` è l'origin browser usato al termine dell'OAuth.

Per il frontend:

```bash
cp tracksByPopularityFront/.env.example tracksByPopularityFront/.env.local
```

Un `VITE_API_BASE_URL` vuoto usa il proxy di sviluppo Vite. DigitalOcean passa il literal build-time `same-origin`, convertito dal frontend in una base browser vuota.

## Sviluppo locale

Docker Compose serve solo per lo sviluppo locale. Avvia MariaDB, Redis, backend e frontend nginx:

```bash
CLIENT_ID=your-client-id \
CLIENT_SECRET=your-client-secret \
REDIRECT_URI=http://localhost:8080 \
FRONTEND_ORIGIN=http://localhost \
docker compose up --build
```

URL locali:

- frontend: `http://localhost`
- backend: `http://localhost:8080`
- health: `http://localhost:8080/api/health`

Per avviare separatamente le applicazioni:

```bash
cd tracksByPopularity
dotnet run
```

```bash
cd tracksByPopularityFront
npm ci
npm run dev
```

Vite espone il frontend su `http://localhost:5173` e inoltra le richieste API al backend.

## Autenticazione Spotify e route API

1. Richiedi `GET /api/auth/login` e apri il `loginUrl` restituito.
2. Spotify reindirizza a `GET /api/auth/callback`.
3. Il backend salva il token Spotify in Redis/Valkey, imposta il cookie HttpOnly `spotify_user_id` e reindirizza alla route SPA `/auth/callback`.
4. Verifica la sessione con `GET /api/auth/is-auth`; esegui il logout con `POST /api/auth/logout`.

Route principali:

- `GET /api/health`
- `GET /api/auth/login`
- `GET /api/auth/callback`
- `GET /api/auth/is-auth`
- `POST /api/auth/logout`
- `GET /api/playlist/all`
- `POST /api/playlist/refresh`
- `POST /api/track/popularity/{range}`
- `GET /api/track/artists`
- `POST /api/track/artist?artistId=...`

## Deploy production su DigitalOcean

`.do/app.yaml` dichiara un deploy same-origin App Platform in `fra`:

- una sola istanza backend ASP.NET Core sulla porta 8080;
- un sito statico Vue/Vite;
- un cluster DigitalOcean Managed MySQL esistente;
- un cluster DigitalOcean Managed Valkey esistente;
- ingress `/api` verso il backend e poi `/` verso il frontend statico;
- `${APP_URL}` per OAuth e redirect frontend, incluso un futuro dominio custom primario.

Il workflow `.github/workflows/deploy-digitalocean.yml` è l'unico driver di deploy. Esegue test backend e build frontend production prima di aggiornare l'app. Non abilitare separatamente il deploy-on-push di App Platform.

### Primo deploy — ordine obbligatorio

1. Autentica `doctl`, poi verifica versioni e size correnti prima del provisioning:

   ```bash
   doctl auth init
   doctl databases options versions --engine mysql
   doctl databases options versions --engine valkey
   doctl databases options slugs --engine mysql
   doctl databases options slugs --engine valkey
   ```

2. Crea entrambi i cluster gestiti in `fra1`, con un nodo da 1 GiB. Se l'account non offre entrambi gli engine e le size in `fra1`, usa `ams` per l'app e `ams3` per entrambi i database; non dividere le risorse tra regioni.

   ```bash
   doctl databases create tracks-popularity-mysql \
     --engine mysql --version 8.4 --region fra1 \
     --size db-s-1vcpu-1gb --num-nodes 1 --wait

   doctl databases create tracks-popularity-valkey \
     --engine valkey --version 8 --region fra1 \
     --size db-s-1vcpu-1gb --num-nodes 1 --wait
   ```

3. Crea il database applicativo e conserva l'utente gestito `doadmin`:

   ```bash
   MYSQL_CLUSTER_ID=$(doctl databases list --format ID,Name --no-header | awk '$2 == "tracks-popularity-mysql" { print $1 }')
   test -n "$MYSQL_CLUSTER_ID"
   doctl databases db create "$MYSQL_CLUSTER_ID" tracksbypopularity
   ```

4. Crea interattivamente i secret GitHub del repository. Non inserire mai i valori nei file:

   ```bash
   gh secret set DIGITALOCEAN_ACCESS_TOKEN
   gh secret set SPOTIFY_CLIENT_ID
   gh secret set SPOTIFY_CLIENT_SECRET
   ```

5. Avvia il primo deploy e attendi i job `verify` e `deploy`:

   ```bash
   gh workflow run deploy-digitalocean.yml --ref main
   gh run watch
   ```

   Il workflow crea o aggiorna l'app `tracks-popularity` e collega i cluster `tracks-popularity-mysql` e `tracks-popularity-valkey`.

6. Leggi l'URL generato `https://*.ondigitalocean.app` in App Platform. Nel pannello Spotify Developer registra esattamente questo callback:

   ```text
   ${APP_URL}/api/auth/callback
   ```

   Se cambia l'origin primario, rilancia `deploy-digitalocean.yml` per aggiornare il binding `${APP_URL}` nel deploy.

7. Verifica l'applicazione pubblicata:

   ```bash
   curl -fsS "${APP_URL}/api/health"
   curl -fsS "${APP_URL}/api/auth/login"
   curl -fsS "${APP_URL}/auth/callback"
   ```

   Health deve restituire `Healthy`. Decodifica `loginUrl` e conferma che `redirect_uri` sia esattamente `${APP_URL}/api/auth/callback`. La route SPA callback aperta direttamente deve restituire il frontend, non 404. Completa un login Spotify reale, poi verifica che il cookie `spotify_user_id` abbia `HttpOnly`, `Secure` e `SameSite=Lax` e che `GET ${APP_URL}/api/auth/is-auth` restituisca `authenticated: true` nella stessa sessione.

### Dominio custom

Imposta il dominio custom come primario in App Platform, aggiorna il callback Spotify al nuovo `${APP_URL}/api/auth/callback`, quindi ridistribuisci. `FRONTEND_ORIGIN` e `REDIRECT_URI` seguono `${APP_URL}` senza host hardcoded nel codice.

### Rollback

Apri la pagina **Deployments** dell'app in DigitalOcean App Platform e ridistribuisci un deployment noto e funzionante. La cancellazione dei database non è un rollback: i cluster MySQL e Valkey gestiti devono restare collegati e conservare lo stato applicativo.

## Comandi di verifica

```bash
dotnet test tracksByPopularity/tracksByPopularity.sln
docker build -f tracksByPopularity/Dockerfile -t tracks-popularity-backend tracksByPopularity
cd tracksByPopularityFront
npm ci
VITE_API_BASE_URL=same-origin npm run build
npm run test:unit -- --run src/__tests__/env.spec.ts
```
