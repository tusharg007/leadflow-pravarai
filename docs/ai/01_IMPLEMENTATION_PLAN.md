# LeadFlow — Implementation Plan

## 1. Goal

A single-screen lead management tool: a sales rep tracks leads, logs every discussion, and sets follow-up reminders. Evaluators check functionality, code quality, delivery (README, git history) and bonus items.

## 2. Stack

**Frontend (`frontend/`)**

- Next.js (App Router), TypeScript `strict`, a single route `/`.
- TanStack Query for server state.
- react-hook-form + Zod for forms.
- Radix UI (Dialog, Select) for accessible primitives.
- Tailwind v4 + class-variance-authority + clsx + tailwind-merge (the same approach as the boilerplate, ported to TypeScript).
- date-fns, sonner, lucide-react.
- Vitest, React Testing Library, MSW.
- Dropped from the boilerplate: react-router, recharts, dnd-kit, axios, auth pages, AI pages. A small typed `fetch` wrapper replaces axios.

**Backend (`backend/`)**

- Node 22 LTS, Express 5, TypeScript `strict`.
- MongoDB 7 with Mongoose 8.
- Zod for request validation, pino for logging, helmet and cors.
- Vitest + supertest + mongodb-memory-server for tests.
- ESLint + Prettier.

**Infra**

- Docker Compose: `mongo`, `backend`, `frontend`.
- `.env.example` at root and in each app.

**Deliberately skipped**

- Login (optional in the assignment).
- AI features. They are out of scope, and polish on the required flows scores better.

## 3. Architecture

```
Browser (Next.js, single screen)
  |  fetch (typed client, TanStack Query cache)
  v
Express API  /api/*   -> zod validate -> service -> mongoose
  |
  v
MongoDB: leads, discussions
```

Layering on the backend: **route -> controller -> service -> model**. Controllers only translate HTTP. Services hold business rules. Models hold schema and indexes.

## 4. Data model (MongoDB)

**`leads`**

| Field                    | Type           | Notes                                                                          |
| ------------------------ | -------------- | ------------------------------------------------------------------------------ |
| `_id`                    | ObjectId       | exposed as `id` (string)                                                       |
| `name`                   | string         | trimmed, 1–120, required                                                       |
| `company`                | string \| null | ≤120                                                                           |
| `phone`                  | string \| null | ≤30                                                                            |
| `status`                 | enum           | `new`, `contacted`, `qualified`, `proposal_sent`, `won`, `lost`; default `new` |
| `followUpAt`             | Date \| null   | UTC                                                                            |
| `lastNote`               | string \| null | denormalized from the latest discussion                                        |
| `lastDiscussionAt`       | Date \| null   | denormalized                                                                   |
| `createdAt`, `updatedAt` | Date           | timestamps                                                                     |

Indexes: `{ status: 1, lastDiscussionAt: -1 }`, `{ followUpAt: 1 }`, `{ name: 1 }`.

**`discussions`** (separate collection, not embedded, because the history is unbounded)

| Field        | Type         | Notes                                             |
| ------------ | ------------ | ------------------------------------------------- |
| `_id`        | ObjectId     | exposed as `id`                                   |
| `leadId`     | ObjectId     | ref `Lead`                                        |
| `content`    | string       | trimmed, 1–5000                                   |
| `kind`       | enum         | `note` or `system`                                |
| `followUpAt` | Date \| null | follow-up set by this note, shown in the timeline |
| `createdAt`  | Date         | no `updatedAt`                                    |

Index: `{ leadId: 1, createdAt: -1 }`.

**Why denormalize `lastNote` / `lastDiscussionAt` on the lead:** the list screen needs them for every lead, and this avoids a per-row lookup or aggregation.

## 5. API contract (prefix `/api`)

All JSON uses camelCase and ISO 8601 UTC strings for dates.

| Method | Path                     | Success                    | Errors   | Notes                                                                                                           |
| ------ | ------------------------ | -------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| GET    | `/health`                | 200                        |          | liveness                                                                                                        |
| GET    | `/leads?status=&q=`      | 200 `LeadSummary[]`        | 400      | `q` is a case-insensitive name contains match with regex characters escaped. Sorted by `lastDiscussionAt` desc. |
| POST   | `/leads`                 | 201 `LeadSummary`          | 400      | Also writes a `system` discussion "Lead created".                                                               |
| GET    | `/leads/:id`             | 200 `LeadDetail`           | 400, 404 | Discussions newest-first.                                                                                       |
| PATCH  | `/leads/:id`             | 200 `LeadSummary`          | 400, 404 | Body: `status` and/or `followUpAt` (`null` clears). Empty body or unknown keys give 400.                        |
| POST   | `/leads/:id/discussions` | 201 `{ discussion, lead }` | 400, 404 | Body: `{ content, followUpAt? }`.                                                                               |

**Shapes**

- `LeadSummary`: `{ id, name, company, phone, status, followUpAt, lastNote, lastDiscussionAt, createdAt, updatedAt }`
- `Discussion`: `{ id, leadId, content, kind, followUpAt, createdAt }`
- `LeadDetail`: `LeadSummary & { discussions: Discussion[] }`

**Error envelope (every error):**
`{ "error": { "code": "validation_error | not_found | internal_error", "message": "...", "details": [{ "field": "...", "message": "..." }] } }`

Status codes: 400 validation (including malformed ObjectId, malformed JSON, invalid query), 404 not found (including unknown routes), 500 unexpected (no stack trace leaked).

**Adding a discussion** (service rule): verify the lead exists, insert the discussion, then atomically `$set` `lastNote`, `lastDiscussionAt` and, only if provided, `followUpAt` on the lead. If the lead update fails, delete the inserted discussion and rethrow. This works on standalone MongoDB and Atlas without a replica set.

## 6. Frontend behaviour rules

- The screen has two sections: **Today's follow-ups** (pinned, sorted by time ascending) and **All leads** (everything else).
- Filter chips: All, New, Contacted, Qualified, Proposal Sent, Won, Lost. Search by name is debounced at 300 ms. Both apply to both sections.
- "Today", "overdue" and "upcoming" are computed in the browser's local timezone from the UTC timestamp. A `useNow(60_000)` tick keeps the buckets correct across midnight.
- Overdue leads show a red follow-up chip in All leads. Won and Lost cards are dimmed.
- Clicking a lead opens the timeline dialog (not a page). Filter, search and open lead id live in the URL (`?status=&q=&lead=<id>`), so the dialog is deep-linkable.
- Saving a note with a follow-up updates the lead's follow-up and the list immediately, by writing the API response into the query cache.
- Status change is optimistic with rollback and a toast on failure.
- A note without a follow-up leaves the existing follow-up unchanged. The dialog offers "Clear follow-up".

## 7. Assumptions to state in the README

1. Follow-up buckets use the browser's local timezone. Storage and transport are UTC.
2. Today's follow-ups appear only in the pinned section and are not repeated in All leads.
3. A note saved without a follow-up does not change the lead's follow-up.
4. No pagination. The list is expected to be small. This is a known trade-off.
5. No transactions. The two-step write is compensated manually so it runs on standalone MongoDB. A replica set with `session.withTransaction` is the upgrade path.
6. No authentication.

## 8. Time budget (about 8h)

| Phase | Work                                  | Time |
| ----- | ------------------------------------- | ---- |
| 0     | Scaffold, repo hygiene, `docs/API.md` | 0.5h |
| 1     | Backend, tests, seed                  | 1.5h |
| 2     | Frontend foundation                   | 1h   |
| 3     | Features (list, add lead, timeline)   | 2.5h |
| 4     | Hardening, accessibility, tests       | 1h   |
| 5     | Docker, README, final verification    | 1.5h |

## 9. Risks and mitigations

| Risk                                                      | Mitigation                                                                          |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Regex or NoSQL injection through `q`                      | Zod-validate `q` as a string and escape regex characters before building the query. |
| Timezone bugs in "today"                                  | Pure `classify` / `partition` functions with boundary tests (23:59, 00:00, DST).    |
| `NEXT_PUBLIC_*` is baked at build time in Docker          | Pass `NEXT_PUBLIC_API_URL` as a build arg and document it.                          |
| Windows line endings breaking shell scripts in containers | `.gitattributes` with `* text=auto eol=lf` and `.editorconfig`.                     |
| One giant commit                                          | Phase-by-phase commits using Conventional Commits.                                  |
| Over-scoping                                              | Non-goals are fixed: no auth, no AI, no pagination.                                 |
