# LeadFlow

I am building a single-screen lead management tool for a Fullstack Intern assessment. I use Next.js, Express, TypeScript, and MongoDB to track leads, discussion history, and follow-ups.

## Project status

I have completed Phase 0 (repository setup and API contract) and Phase 1 (backend). I will add the frontend in Phases 2–3 and Docker Compose in Phase 5. The frontend, screenshot, demo, and Docker sections remain placeholders until those phases are implemented.

## Setup

I use Node.js 22.13 or newer within the Node 22 major, npm, and a running MongoDB 7 instance. My local checks used Node 22.21.0. I run these commands from the repository root.

If MongoDB is installed and `mongod` is on PATH, I can start an isolated local instance in a separate terminal:

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

I then install and start the backend in another terminal:

On my development Windows machine, the default npm launcher points at a missing module. I can bypass that launcher for the current PowerShell session with the installed npm CLI, then run the normal commands below:

```powershell
function npm { & node 'C:/Program Files/node_modules/npm/bin/npm-cli.js' @args }
```

I only need this workaround on a machine with that specific installation path and launcher problem; a normal Node.js installation runs the commands directly.

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

I edit `backend/.env` if my MongoDB address or browser origin differs. My backend loads `.env` relative to its working directory, so I run its npm scripts from `backend/`. The root `.env.example` reserves the combined configuration for the later Compose setup.

I check the API with `curl.exe http://localhost:4000/api/health` in PowerShell or `curl http://localhost:4000/api/health` on macOS/Linux. I expect `{ "status": "ok" }`.

For the compiled backend, I use:

```sh
cd backend
npm run build
npm run seed:prod
npm start
```

I stop the server with Ctrl+C. My server handles SIGINT and SIGTERM by closing HTTP connections and disconnecting MongoDB, with a ten-second shutdown limit.

## Environment

| Variable            | Default / example                  | Purpose                                                                  |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| PORT                | 4000                               | Backend listen port                                                      |
| MONGODB_URI         | mongodb://127.0.0.1:27017/leadflow | Required database URI                                                    |
| CORS_ORIGINS        | http://localhost:3000              | Comma-separated HTTP(S) browser origins, without paths or trailing slash |
| NODE_ENV            | development                        | development, test, or production                                         |
| LOG_LEVEL           | info                               | fatal, error, warn, info, debug, trace, or silent                        |
| NEXT_PUBLIC_API_URL | http://localhost:4000/api          | Reserved for the frontend; unused by the backend                         |

I never commit real `.env` files. My logs exclude request bodies, headers, query strings, and raw driver error messages to avoid exposing credentials.

## Seed

I seed six fictional leads covering all statuses, with three discussions each. I include Sarah Connor, Hank Scorpio, Bill Lumbergh, Bruce Wayne, Diana Prince, and Peter Parker. Sarah has a follow-up today at 2 PM; Bill has one yesterday; Diana has one in two days.

I calculate seed dates in the process's local timezone and store UTC dates. For a browser walkthrough, I run the seed in the same timezone as my browser. Repeated seed runs skip fixtures with their deterministic IDs and preserve user changes. I use `npm run seed -- --reset` (or `npm run seed:prod -- --reset`) only when I intend to delete **all leads and discussions in the configured database** and refresh the fixtures relative to the current date. I do not run seed processes concurrently.

## API and architecture

I define the HTTP contract in [docs/API.md](docs/API.md). My backend separates routes, controllers, services, and Mongoose models. I keep the reference assignment and screenshots local and excluded from Git.

| Method | Path                          | Result                                    |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | /api/health                   | Liveness                                  |
| GET    | /api/leads?status=new&q=sarah | Filtered list, last discussion descending |
| POST   | /api/leads                    | New lead plus system discussion           |
| GET    | /api/leads/:id                | Lead plus newest-first history            |
| PATCH  | /api/leads/:id                | Status and/or follow-up update            |
| POST   | /api/leads/:id/discussions    | Note and updated lead summary             |

I can create a lead on macOS/Linux with:

```sh
curl -X POST http://localhost:4000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sarah Connor","company":"Acme Corp","phone":"555-0199"}'
```

In PowerShell, I use JSON serialization to avoid native argument quoting differences:

```powershell
$leadBody = @{ name = 'Sarah Connor'; company = 'Acme Corp'; phone = '555-0199' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4000/api/leads -ContentType 'application/json' -Body $leadBody
```

I organize the implemented backend as follows:

```text
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
docs/codex/               implementation brief
```

## Assumptions

- I store and transport timestamps in UTC; I will calculate follow-up buckets in the browser's local timezone.
- I will show today's follow-ups only in the pinned section.
- I preserve a lead's follow-up when a note omits `followUpAt`; explicit `null` clears it.
- I keep the list unpaginated because I expect a small assessment dataset.
- I use compensated writes instead of transactions so the backend works with standalone MongoDB.
- I omit authentication as directed by the project brief.
- I treat all mutation bodies and list query parameters as strict objects, rejecting unknown keys and repeated query values.
- I accept only name, company, and phone when creating a lead; its initial status is always New.
- I use the available assignment copy at `reference/06_ASSIGNMENT_REFERENCE.md`; the requested `reference/ASSIGNMENT.md` is absent.

## Known trade-offs

I cannot guarantee cross-collection atomicity across process crashes or cleanup failures without MongoDB transactions. I compensate ordinary write failures and test those paths. Overlapping discussion writes use the last completed lead update for the summary; I do not promise conflict resolution across concurrent requests. My seed does not repair a pre-existing fixture left incomplete by a process crash; I use reset to rebuild demo data when needed.

I use literal substring search, which can scan the collection despite the name index. I accept this for a small unpaginated dataset. `/api/health` is liveness only, and API failures never expose internal diagnostics. I have not implemented or verified frontend flows or Docker yet.

## Testing

I run the backend gate from `backend/`:

```sh
npm run lint && npm run typecheck && npm test && npm run build
npm run format:check
```

In Windows PowerShell 5.1, I run each command separately because it does not support `&&`; PowerShell 7 supports the combined command. My 64 tests cover the contract, malformed JSON, strict validation, ordering, literal search, follow-up preservation and clearing, persistence, error privacy, compensated writes, and seed behavior. I run an isolated MongoDB 7.0.24 via `mongodb-memory-server`; the initial install/test needs network access to download its binary, and the tests never use `MONGODB_URI` from my real database.

I record the Phase 1 results in [docs/codex/05_PHASE_0_1_REPORT.md](docs/codex/05_PHASE_0_1_REPORT.md). I leave frontend checks unrun until that app exists and Docker checks until Phase 5.

## Screenshots and demo

I will add screenshots and a demo video after the frontend is ready.

## AI usage

I used OpenAI Codex to read the assessment, define the API contract, scaffold the repository, and implement and test the backend. Codex performed the automated checks reported in this repository; I still need to complete my own review and browser walkthrough before submission. I record the scope and prompts in [docs/AI_USAGE.md](docs/AI_USAGE.md).
