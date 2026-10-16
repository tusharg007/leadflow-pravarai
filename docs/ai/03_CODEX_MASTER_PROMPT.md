# LeadFlow — Master Prompt for Codex

> This file is the build brief. Either paste it into Codex, or keep it at `docs/ai/03_CODEX_MASTER_PROMPT.md` and tell Codex to read and follow it.

---

You are building **LeadFlow** for a Fullstack Intern take-home. Evaluators will read the code, the README and the git history, and they will run the app. Correctness, code quality and clarity beat feature count.

## 0. Read first

1. `AGENTS.md` (standing rules).
2. `docs/ai/01_IMPLEMENTATION_PLAN.md` (architecture, data model, API, assumptions).
3. `reference/ASSIGNMENT.md` (the assignment text).
4. `reference/wireframes/*.png` (suggestions; match the layout and feel).
5. `reference/boilerplate/`: read `src/index.css`, `src/components/ui/{Button,Badge,Dialog,Input,Skeleton}.jsx`, `src/lib/{utils,format}.js`, and the service-layer pattern in `src/lib/{api,services}.js`. This is style reference only; rewrite everything in TypeScript.

## 1. Scope

A single-screen lead management tool. One route `/`. All detail views are dialogs, never separate pages. No login. No AI features. No pagination.

**Required**

- Lead list showing name, status badge, last discussion note, and time since last discussion.
- Filter by status: New, Contacted, Qualified, Proposal Sent, Won, Lost.
- Today's follow-ups pinned at the top.
- Timeline dialog: full discussion history newest-first; a form at the bottom to add a note with an optional follow-up date and time; saving a note with a follow-up updates the lead's follow-up and the list immediately; status can be changed from the dialog.
- Add New Lead: name required; company and phone optional; status defaults to New.

**Bonus (do all)**

- Search leads by name.
- Overdue follow-ups highlighted in red.
- Docker Compose setup.
- Seed script with at least 6 leads and discussions.

## 2. Repo layout

```
leadflow/
  frontend/        Next.js (App Router) + TypeScript strict
  backend/         Express + TypeScript + Mongoose
  docs/            API.md, AI_USAGE.md, ai/ (this kit)
  docker-compose.yml
  .env.example
  README.md
  AGENTS.md
  .editorconfig
  .gitattributes   (* text=auto eol=lf)
  .gitignore       (must include reference/, .env*, !.env.example, node_modules, dist, .next)
```

## 3. Backend (`backend/`)

**Libraries:** express (v5), mongoose (v8), zod, pino + pino-http, helmet, cors, dotenv or Node `--env-file`, tsx (dev), typescript, vitest, supertest, mongodb-memory-server, eslint, prettier. Verify versions first.

**Structure**

```
backend/src/
  server.ts                 start: connect DB, listen, graceful shutdown
  app.ts                    build the Express app (no listen), exported for tests
  config/env.ts             zod-validated env: PORT, MONGODB_URI, CORS_ORIGINS, NODE_ENV, LOG_LEVEL
  config/db.ts              mongoose connect/disconnect
  models/lead.model.ts
  models/discussion.model.ts
  schemas/lead.schema.ts    zod: createLead, updateLead, listQuery, idParam
  schemas/discussion.schema.ts
  services/lead.service.ts
  services/discussion.service.ts
  controllers/lead.controller.ts
  controllers/discussion.controller.ts
  routes/index.ts, lead.routes.ts, health.routes.ts
  middleware/validate.ts, errorHandler.ts, notFound.ts
  utils/AppError.ts, escapeRegex.ts, serialize.ts
  scripts/seed.ts
backend/tests/
```

Pick one module system (ESM or CommonJS) and configure `tsconfig` so that dev (tsx), tests (vitest) and the Docker build all work. Prefer the simplest setup that works.

**Models**

- `Lead`: `name` (trim, 1–120, required), `company` (≤120, nullable), `phone` (≤30, nullable), `status` enum `new | contacted | qualified | proposal_sent | won | lost` (default `new`), `followUpAt` (Date, nullable), `lastNote` (string, nullable), `lastDiscussionAt` (Date, nullable), timestamps. Indexes: `{status:1, lastDiscussionAt:-1}`, `{followUpAt:1}`, `{name:1}`.
- `Discussion`: `leadId` (ObjectId ref Lead, required), `content` (trim, 1–5000), `kind` enum `note | system` (default `note`), `followUpAt` (Date, nullable), `createdAt` only. Index `{leadId:1, createdAt:-1}`.
- JSON output: expose `id` (string), hide `_id` and `__v`, dates as ISO strings. Implement this in one place (`utils/serialize.ts` or a schema `toJSON` transform).
- Normalize empty or whitespace-only optional strings to `null`.

**Endpoints (prefix `/api`)**

- `GET /health` -> 200 `{ status: "ok" }`.
- `GET /leads?status=&q=` -> 200 `LeadSummary[]`. `status` must be a valid enum value. `q` is a trimmed string (max 100), matched as a case-insensitive "name contains" with regex special characters escaped. Sort by `lastDiscussionAt` desc, then `_id` desc.
- `POST /leads` -> 201 `LeadSummary`. Also inserts a `system` discussion with content "Lead created" and sets `lastNote` and `lastDiscussionAt` accordingly.
- `GET /leads/:id` -> 200 `LeadDetail` (summary + `discussions` newest-first).
- `PATCH /leads/:id` -> 200 `LeadSummary`. Body (strict, unknown keys rejected): `status` and/or `followUpAt` (ISO string with offset, or `null` to clear). An empty body is 400.
- `POST /leads/:id/discussions` -> 201 `{ discussion, lead }`. Body: `{ content, followUpAt? }`.
  Service rule: verify the lead exists; insert the discussion; then one atomic `findOneAndUpdate` that `$set`s `lastNote`, `lastDiscussionAt`, and `followUpAt` only if provided, returning the new document. If the lead update fails, delete the inserted discussion and rethrow. A note without `followUpAt` must leave the lead's `followUpAt` unchanged.

**Response shapes**

- `LeadSummary`: `{ id, name, company, phone, status, followUpAt, lastNote, lastDiscussionAt, createdAt, updatedAt }`.
- `Discussion`: `{ id, leadId, content, kind, followUpAt, createdAt }`.
- `LeadDetail`: `LeadSummary & { discussions: Discussion[] }`.

**Errors and status codes**

- Success: 200, 201.
- 400: Zod failures (body, query, params), malformed ObjectId, malformed JSON.
- 404: unknown lead, unknown route.
- 500: unexpected; log the error with pino, return a generic message, never a stack trace.
- Every error uses this envelope: `{ "error": { "code": "validation_error | not_found | internal_error", "message": "...", "details": [{ "field": "name", "message": "..." }] } }` (`details` only for validation errors).
- Use a single `AppError` class and a single error-handling middleware. Express 5 forwards async errors automatically; do not add try/catch wrappers.

**Security and hygiene:** `helmet`, `cors` restricted to `CORS_ORIGINS` (comma-separated), `express.json({ limit: "100kb" })`, `x-powered-by` disabled, graceful shutdown on SIGTERM/SIGINT, no secrets in logs.

**Seed (`npm run seed`, plus `npm run seed:prod` that runs from `dist/` for use inside Docker)**

- Idempotent; supports `--reset` to wipe and reseed.
- At least 6 leads covering all six statuses, each with 2–4 discussions, timestamps relative to now.
- Include one follow-up **today**, one **overdue**, and one in the **future**.
- Reuse the wireframe data: Sarah Connor (Acme Corp, 555-0199, Proposal Sent, follow-up today 2:00 PM), Hank Scorpio (Globex, New), Bill Lumbergh (Initech, Contacted), Bruce Wayne (Wayne Ent, Won), plus at least two more.

**Backend tests (vitest + supertest + mongodb-memory-server), at least 15**

- create lead -> 201 and shape.
- empty name -> 400 with envelope and `details`.
- malformed id -> 400; unknown id -> 404; unknown route -> 404.
- invalid `status` filter -> 400.
- list filter by status.
- search by name, including a query with regex characters (e.g. `a.*` or `(`) behaving as literal text.
- list sort order.
- add discussion with follow-up updates the lead (`followUpAt`, `lastNote`, `lastDiscussionAt`).
- add discussion without follow-up leaves `followUpAt` unchanged.
- discussions returned newest-first.
- PATCH status persists; PATCH `followUpAt: null` clears; empty PATCH -> 400; unknown key -> 400.
- creating a lead writes the "Lead created" system discussion.
- error handler never leaks a stack trace on 500.

**Scripts:** `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `seed`, `seed:prod`.

## 4. Frontend (`frontend/`)

**Libraries:** next, react, typescript, tailwindcss v4, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, @radix-ui/react-dialog, @radix-ui/react-select, class-variance-authority, clsx, tailwind-merge, date-fns, sonner, lucide-react; dev: vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, msw, eslint (next config), prettier. Verify versions first.

**Structure**

```
frontend/src/
  app/layout.tsx, page.tsx, providers.tsx, globals.css
  components/ui/       Button, Badge, Input, Textarea, Select, Dialog, Skeleton, Spinner, Toaster
  features/leads/
    api/               client.ts (typed fetch wrapper + ApiError), leads.api.ts, types.ts, schemas.ts
    hooks/             useLeads, useLeadDetail, useCreateLead, useAddDiscussion, useUpdateLead,
                       useDebouncedValue, useNow, useLeadUrlState
    lib/               followUp.ts, status.ts, format.ts
    components/        LeadScreen, Header, StatusFilter, LeadSearch, LeadList, LeadCard,
                       FollowUpChip, StatusBadge, AddLeadDialog, LeadTimelineDialog, Timeline,
                       TimelineEntry, DiscussionForm, StatusSelect, EmptyState, ErrorState, ListSkeleton
  lib/                 cn.ts, env.ts (validated NEXT_PUBLIC_API_URL)
```

**Types:** `Lead`, `Discussion`, `LeadDetail`, `LeadStatus` mirror `docs/API.md` exactly (camelCase). Validate API responses with Zod in the API layer, so bad data fails loudly.

**State and behaviour**

- TanStack Query for all server state. Query keys: `["leads", { status, q }]` and `["lead", id]`.
- Filter, search and open lead id live in the URL (`?status=&q=&lead=<id>`). Opening a lead is a dialog, not a navigation.
- Search is debounced (300 ms). Status filter and search apply to both sections.
- Mutations write the API response into the caches so the list reflects changes immediately, then invalidate to resync.
  - Add note with follow-up: update `["lead", id]` and the lead in every cached `["leads", ...]` list.
  - Status change: optimistic with rollback, toast on failure.
  - Add lead: appears immediately.
- `followUp.ts` has pure functions: `classify(followUpAt, now)` returns `"today" | "overdue" | "upcoming" | "none"` using the local day boundary; `partition(leads, now)` returns `{ today, rest }`. `useNow(60_000)` re-renders so buckets stay correct across midnight.
- Pinned section "Today's follow-ups": strictly today's, sorted by time ascending. "All leads": everything else, in API order.
- Overdue leads in All leads show a **red** follow-up chip. Upcoming show a neutral chip. Won and Lost cards are dimmed.
- Forms use react-hook-form + Zod.
  - `DiscussionForm`: textarea, "Set follow-up" checkbox that enables date and time inputs (both required when checked; date `min` = today). Convert local date + time to a UTC ISO string with offset before sending.
  - Map API `details[].field` errors back to form fields.
- "Clear follow-up" action in the timeline dialog when a follow-up is set (`PATCH followUpAt: null`).
- Every async surface has loading (skeleton or spinner), empty and error (with retry) states. Disable submit while pending. Show toasts for success and failure.
- Absolute timestamps in the timeline, plus relative time ("2 days ago"). Show the absolute time in a `title` tooltip for relative times in the list.

**Accessibility:** Radix focus trap and Esc to close; every input labelled; filter chips use `aria-pressed`; visible focus rings; errors announced via `aria-live`; the lead card is a real `<button>`; AA contrast.

**UI spec (fallback if the images cannot be read)**

- White header bar: left "LeadFlow" with a trending-up icon in blue-600, bold; right a blue-600 "+ Add New Lead" button. Page background slate-50. Content centered, max width about 62rem.
- Filter row: uppercase "FILTERS:" label, then pills All / New / Contacted / Qualified / Proposal Sent / Won / Lost. Active = slate-800 fill with white text; inactive = white with a border. Horizontally scrollable on mobile. Search input to the right on desktop, full width above the chips on mobile.
- Section labels, small uppercase tracking-wider slate-500: "TODAY'S FOLLOW-UPS" (pin icon) and "ALL LEADS".
- Lead card: bold name plus muted "(Company)"; status pill top-right (New = green, Contacted = yellow, Qualified = blue, Proposal Sent = purple, Won = slate, Lost = rose); a line "**Last Note:** <truncated note> <muted time-ago>". Today's cards use a blue-50 background with a blue border and a blue chip "Follow-up today at 2:00 PM".
- Add dialog: title "Add New Lead", close X, fields "Full Name *", "Company (Optional)", "Phone (Optional)", footer "Cancel" and a blue "Save Lead".
- Timeline dialog: header "Name (Company)" with the phone beneath; status Select at top-right beside the X. Body: vertical timeline with dots (latest = blue, older = grey); each entry shows "May 4, 10:30 AM (2 days ago)" above a bordered card; a follow-up chip "Follow-up set for: May 6, 2:00 PM" inside the entry; system entries in italics. Footer: textarea "Log a new discussion...", checkbox "Set Follow-up" with date and time inputs, dark slate "Save Note" button on the right. The body scrolls; header and footer stay fixed.
- Design tokens: port the boilerplate's `@theme` token approach, with the wireframe's blue-600 as the brand colour and Inter loaded through `next/font`. Do not reuse the boilerplate's brand name, gradient, or Sora font.

**Frontend tests (vitest + RTL + MSW)**

- `followUp.ts`: classify and partition, including boundary cases (23:59, 00:00, exactly now, DST change day).
- Zod schemas (lead form, discussion form).
- Integration: open a lead, add a note with a follow-up today, and see the lead move into the pinned section without a reload.
- Integration: add a lead, and see it appear in the list.
- Integration: change status, see it reflected; and rollback on a failed request.

**Scripts:** `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `test`, `format`.

## 5. Delivery

- `docs/API.md`: the contract (endpoints, shapes, error envelope, examples). Written in Phase 0 before any code.
- `docker-compose.yml`:
  - `mongo` (mongo:7, volume, healthcheck via `mongosh --eval "db.adminCommand('ping')"`).
  - `backend` (multi-stage Dockerfile: build with `tsc`, run `node dist/server.js` as a non-root user; waits for mongo healthy).
  - `frontend` (multi-stage Dockerfile, Next.js `output: "standalone"`; `NEXT_PUBLIC_API_URL` passed as a build arg, default `http://localhost:4000/api`).
  - Seed with `docker compose exec backend npm run seed:prod`, or `SEED_ON_START=true`.
- `.env.example` at root, `backend/.env.example` and `frontend/.env.example`, every variable documented with a comment.
- `README.md`: what it is; screenshot placeholders; quick start with Docker; manual start (backend then frontend) with exact commands for Windows PowerShell and macOS/Linux; env variable table; API table with example `curl`; architecture overview and folder tour; assumptions; known trade-offs; testing; and an **"AI usage"** section that is honest and specific (tools used, what was generated, what I reviewed and changed). Written in first person singular.
- `docs/AI_USAGE.md`: how AI was used, plus a copy of the prompts used.

## 6. Working agreement

Work in phases and stop after each one:

0. Scaffold + `docs/API.md`
1. Backend
2. Frontend foundation
3. Features (3a list/filters/search/pinned; 3b dialogs/forms/status)
4. Hardening + tests
5. Delivery (Docker, README, final verification)

At the end of each phase: run the verification gates from `AGENTS.md`, commit with Conventional Commits, and report in the format given in `AGENTS.md`.

**Start with Phase 0 and Phase 1 only.**
