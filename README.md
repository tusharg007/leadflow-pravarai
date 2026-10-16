# LeadFlow

LeadFlow is a solo Fullstack Intern assessment for tracking leads, discussions and follow-ups. The stack uses Next.js App Router, strict TypeScript, Tailwind v4, Express 5, Mongoose 8 and MongoDB 7. Features include status filters, search, pinned daily follow-ups, overdue reminders, timeline dialogs, notes, persistent status changes, follow-up clearing, lead creation and a six-lead seed.

![LeadFlow desktop](docs/screenshots/list-1280.png)

An annotated 3:24 walkthrough ([release](https://github.com/tusharg007/leadflow-pravarai/releases/tag/walkthrough-2026-10-16), [chapter guide](docs/DEMO_WALKTHROUGH.md)) and a [Docker build check](docs/demo/docker-quick-check.mp4) show the main flows; both are automated recordings.

## Docker quick start

Requires Docker Desktop with Linux containers and Compose v2. From a fresh clone's root, run:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
docker compose -p leadflow up --build -d
docker compose -p leadflow ps
# Wait for all three services to be healthy before seeding.
docker compose -p leadflow exec -T backend npm run seed:prod
Start-Process http://localhost:3000
```

```sh
# macOS / Linux
cp .env.example .env
docker compose -p leadflow up --build -d
docker compose -p leadflow ps
# Wait for all three services to be healthy.
docker compose -p leadflow exec -T backend npm run seed:prod
# Open http://localhost:3000 in a browser.
```

Check the API in PowerShell with `Invoke-RestMethod http://localhost:4000/api/health` and `Invoke-RestMethod http://localhost:4000/api/leads`. Stop only this project with `docker compose -p leadflow down`, preserving `leadflow_mongo_data`.

The MongoDB service publishes no host port, and generated names keep an existing `leadflow-mongo` separate from `leadflow-mongo-1`. If 3000/4000 is busy, change root `.env` values `FRONTEND_PORT`/`PORT`, update `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL` to the new browser URLs, then rebuild. Never use the internal Docker hostname `backend` as the browser API URL.

## Manual start

Requires Node.js 22.13 or newer within the Node 22 major, npm and MongoDB 7. Verification used Node 22.21.0. Start from the repository root.

If MongoDB is installed and `mongod` is on PATH, start an isolated local instance in a separate terminal:

```powershell
# Windows PowerShell
New-Item -ItemType Directory -Force .cache/mongo-data
mongod --dbpath .cache/mongo-data --bind_ip 127.0.0.1 --port 27017
```

```sh
# macOS / Linux
mkdir -p .cache/mongo-data
mongod --dbpath .cache/mongo-data --bind_ip 127.0.0.1 --port 27017
```

Install and start the backend in another terminal:

```powershell
# Windows PowerShell
Set-Location backend
Copy-Item .env.example .env
npm ci
npm run seed
npm run dev
```

```sh
# macOS / Linux
cd backend
cp .env.example .env
npm ci
npm run seed
npm run dev
```

Start the frontend from the repository root in another terminal:

```powershell
# Windows PowerShell
Set-Location frontend
Copy-Item .env.example .env.local
npm ci
npm run dev
```

```sh
# macOS / Linux
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`. Edit `backend/.env` for database/origin changes and `frontend/.env.local` for the API URL. Run scripts from each app's directory to load its environment; root `.env` supplies Compose values.

Check the API with `curl.exe http://localhost:4000/api/health` in PowerShell or `curl http://localhost:4000/api/health` on macOS/Linux. Expect `{ "status": "ok" }`.

For the compiled backend, run these cross-platform commands:

```powershell
cd backend
npm run build
npm run seed:prod
npm start
```

Stop the server with Ctrl+C. The server handles SIGINT and SIGTERM by closing HTTP connections and disconnecting MongoDB, with a ten-second shutdown limit.

For a manual production frontend, run `npm run build` and `npm start` from `frontend/`, setting its public API URL before building. Stop each manual server with Ctrl+C.

## Environment

| Variable            | Default / example                  | Purpose                                                                    |
| ------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| PORT                | 4000                               | Backend listen port                                                        |
| MONGODB_URI         | mongodb://127.0.0.1:27017/leadflow | Required database URI                                                      |
| CORS_ORIGINS        | http://localhost:3000              | Comma-separated HTTP(S) browser origins, without paths or trailing slash   |
| NODE_ENV            | development                        | development, test, or production                                           |
| LOG_LEVEL           | info                               | fatal, error, warn, info, debug, trace, or silent                          |
| NEXT_PUBLIC_API_URL | http://localhost:4000/api          | Browser API URL embedded at build time; passed as a Compose build argument |
| FRONTEND_PORT       | 3000                               | Compose frontend host port; internal port stays 3000                       |

In Compose, `PORT` is the backend host port; internal backend port remains 4000. Compose fixes `MONGODB_URI` to its private service and `NODE_ENV` to production. The optional browser runner sets `FRONTEND_URL`/`E2E_API_URL` for alternate free ports; they are unused by the product and can also configure a direct Playwright run.

Never commit real `.env` files. Logs exclude request bodies, headers, query strings, and raw driver error messages to avoid exposing credentials.

## Seed

The seed creates six fictional leads covering all statuses, with three discussions each: Sarah Connor, Hank Scorpio, Bill Lumbergh, Bruce Wayne, Diana Prince, and Peter Parker. Relative to the seed instant, Sarah's follow-up is 30 minutes ahead, Bill's is 26 hours earlier, and Diana's is 50 hours ahead.

Seed dates use elapsed millisecond offsets and UTC storage, independently of the process timezone. Sarah's follow-up can fall on the next local day when seeding within 30 minutes of midnight. Repeated seed runs skip fixtures with their deterministic IDs and preserve user changes. Use `npm run seed -- --reset` (or `npm run seed:prod -- --reset`) only when intending to delete **all leads and discussions in the configured database** and refresh the fixtures relative to the current instant. Do not run seed processes concurrently.

Inside Docker, use `docker compose -p leadflow exec -T backend npm run seed:prod`; append `-- --reset` only when intending to rebuild that project's demo data.

## API and architecture

The HTTP contract is in [docs/API.md](docs/API.md). The backend separates routes, controllers, services, and Mongoose models. The reference assignment and screenshots remain local and excluded from Git.

| Method | Path                          | Result                                    |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | /api/health                   | Liveness                                  |
| GET    | /api/leads?status=new&q=sarah | Filtered list, last discussion descending |
| POST   | /api/leads                    | New lead plus system discussion           |
| GET    | /api/leads/:id                | Lead plus newest-first history            |
| PATCH  | /api/leads/:id                | Status and/or follow-up update            |
| POST   | /api/leads/:id/discussions    | Note and updated lead summary             |

Create a lead on macOS/Linux with:

```sh
curl -X POST http://localhost:4000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sarah Connor","company":"Acme Corp","phone":"555-0199"}'
```

In PowerShell, use JSON serialization to avoid native argument quoting differences:

```powershell
$leadBody = @{ name = 'Sarah Connor'; company = 'Acme Corp'; phone = '555-0199' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/leads -ContentType 'application/json' -Body $leadBody
```

Repository layout:

```text
frontend/src/app/          route, layout, Inter, providers, tokens
frontend/src/components/   accessible TypeScript primitives
frontend/src/features/     API, hooks, forms, list/dialog UI, date utilities
frontend/tests/            Vitest + RTL + MSW integration
frontend/e2e/              one Playwright persistence smoke test
frontend/scripts/          isolated browser runner and screenshots
backend/src/config/       environment, database, logger
backend/src/models/       indexed Mongoose schemas
backend/src/schemas/      strict request validation
backend/src/routes/       endpoint wiring
backend/src/controllers/  HTTP translation
backend/src/services/     persistence and compensation rules
backend/src/middleware/   validation, not-found, error envelope
backend/src/utils/        errors, normalization, serialization, regex escaping
backend/src/scripts/      seed CLI, fixtures, persistence
backend/tests/            API, HTTP, persistence, seed tests
docs/API.md               shared contract
docs/ai/                  implementation brief
```

## Assumptions

- Timestamps are stored and transported in UTC; follow-up buckets use the browser's local timezone.
- Today's follow-ups appear only in the pinned section, sorted by time; the rest retain API order. Earlier times today remain pinned and show a red overdue chip. A follow-up is overdue strictly before the current instant; exactly now is not overdue.
- A note that omits `followUpAt` preserves the lead's follow-up; explicit `null` clears it.
- The list is unpaginated because a small assessment dataset is expected.
- Compensated writes replace transactions so the backend works with standalone MongoDB.
- Authentication is omitted as directed by the project brief.
- All mutation bodies and list query parameters are strict objects; unknown keys and repeated query values are rejected.
- Only name, company, and phone are accepted when creating a lead; its initial status is always New.
- Both local date/time are required when follow-up is enabled. Past dates and nonexistent DST-gap times are rejected; JavaScript's earlier occurrence is used for ambiguous repeated times.
- Invalid URL status falls back to All; search is capped at 100 characters. Typing search replaces the history entry; filters/dialogs use history entries.
- Inter is bundled locally through next/font/local so builds do not need Google Fonts.

## Known trade-offs

Cross-collection atomicity across process crashes or cleanup failures cannot be guaranteed without MongoDB transactions. Ordinary write failures are compensated and those paths are tested. Overlapping discussion writes use the last completed lead update for the summary; conflict resolution across concurrent requests is not guaranteed. The seed does not repair a pre-existing fixture left incomplete by a process crash; use reset to rebuild demo data when needed.

Literal substring search can scan the collection despite the name index. This is accepted for a small unpaginated dataset. `/api/health` is liveness only, and API failures never expose internal diagnostics. The frontend uses TanStack Query cache updates and optimistic status rollback, URL state `?status=&q=&lead=`, 300ms search debounce and a one-minute clock refresh; dialogs keep every flow on `/`.

ESLint 9.39.5 is retained because Next's React plugin does not support ESLint 10. npm marks ESLint 9 unsupported and reports five high development-only advisories through Next's lint glob chain (`braces` stack-exhaustion); no patched braces release is available. This is recorded separately from production dependencies.

## Testing

Run the same gate from `backend/` and `frontend/`:

```powershell
npm run lint && npm run typecheck && npm test && npm run build
npm run format:check
```

In PowerShell 5.1, run each command separately; PowerShell 7 and macOS/Linux support the combined command. The 68 backend and 49 frontend tests cover contracts, persistence, privacy, compensation, timezone-independent seeds, overdue/DST boundaries, request headers, cache movement/rollback, keyboard focus, slow/error states and double submits. Tests use isolated MongoDB 7.0.24 and MSW; the initial run may download a large binary.

With both app dependencies installed, run optional browser checks from `frontend/`:

```powershell
npx playwright install chromium
npm run test:e2e
npm run screenshots
```

The runner seeds an isolated database, builds both apps, starts owned servers on free ports and stops them afterwards. The smoke test verifies follow-up movement and status persistence after reload. Screenshot checks cover 360/768/1280 layouts, focus trapping, maximum-length text, overdue contrast and reachable dialog controls at 360×640 and 320×568. Verification data for the recordings is in docs/demo/.

## Screenshots and demo

- Screenshots: [mobile](docs/screenshots/list-360.png), [tablet](docs/screenshots/list-768.png), [add-lead](docs/screenshots/add-lead-dialog.png), [timeline](docs/screenshots/timeline-dialog.png), [long mobile timeline](docs/screenshots/timeline-long-mobile.png), and [overdue](docs/screenshots/overdue-lead.png).
- Videos: [full walkthrough](docs/demo/leadflow-walkthrough.mp4) and [Docker build check](docs/demo/docker-quick-check.mp4).
- Verification: [walkthrough data](docs/demo/walkthrough-verification.json) and [Docker check data](docs/demo/docker-quick-check-verification.json).

## How AI was used

The brief encourages AI tooling, so here is exactly how I used it.

- **Review (Claude):** I used Claude to review the delivered code and test evidence.
- **Implementation (OpenAI Codex):** Codex implemented stuffs under my guidance and it utilised the prompts and the rules in `AGENTS.md`.
- **My part:** I set the requirements and stack (Next.js + TypeScript, with an Express/MongoDB backend instead of the suggested FastAPI) and approved a contract-first plan with quality gates: strict TypeScript, lint, typecheck, tests and build. I treated generated code as a draft. I ran the Docker setup, seed, API error cases and browser checks myself, then had an independent review find real defects: timezone-dependent seed dates, a clipped mobile dialog with very long names, closed leads shown as overdue, and needless CORS preflights. Each was fixed with a regression test. The design decisions and trade-offs are documented in this README.
- **Demo videos:** the recordings in `docs/demo/` are automated Playwright recordings produced with Codex, not manual screen captures.

Prompts, the plan and run notes are in [docs/ai](docs/ai/) and [docs/AI_USAGE.md](docs/AI_USAGE.md).
