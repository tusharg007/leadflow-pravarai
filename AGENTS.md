# AGENTS.md

Project: **LeadFlow**, a take-home assessment for a Fullstack Intern role.
This is a **solo project**. Write the README and all docs in first person singular, never "we".

## Stack
- Frontend: Next.js (App Router) + TypeScript strict + Tailwind v4, in `frontend/`.
- Backend: Node 22 + Express 5 + TypeScript strict + MongoDB (Mongoose), in `backend/`.
- Infra: Docker Compose (mongo, backend, frontend).

## Read first
- `docs/codex/01_IMPLEMENTATION_PLAN.md` and `docs/codex/03_CODEX_MASTER_PROMPT.md`.
- `reference/ASSIGNMENT.md` and `reference/wireframes/*.png`.
- `reference/boilerplate/` is **style reference only**.

## Rules
- TypeScript strict everywhere. No `any`. No `@ts-ignore` or `@ts-expect-error` without a comment explaining why.
- `reference/` is read-only and gitignored. Never copy the boilerplate's branding, mock data, auth, dashboard, pipeline, or AI pages. Port only the design-token approach and the UI primitive patterns, rewritten in TypeScript.
- Contract first: `docs/API.md` is the single source of truth for the API. Backend and frontend must both conform to it. If you change the contract, update `docs/API.md` in the same commit.
- Verify package versions with `npm view <pkg> version` before pinning. Do not rely on memory.
- Commits: small, meaningful, Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`). One logical change per commit. Never one giant commit.
- Never commit `.env` files, secrets, or `reference/`. Always keep `.env.example` complete and current.
- Keep files focused. Components stay under about 150 lines; extract hooks and pure utilities.
- No dead code, no commented-out code, no `console.log` in committed code (use the logger).
- If the spec is ambiguous, choose the simplest reasonable option, record it under "Assumptions" in the README, and continue. Only stop if you are blocked.
- Do not add features outside the scope: no auth, no AI features, no pagination.

## Verification gates (run and report after every phase)
- Backend (`backend/`): `npm run lint && npm run typecheck && npm test && npm run build`
- Frontend (`frontend/`): `npm run lint && npm run typecheck && npm test && npm run build`
- Docker (Phase 5): `docker compose up --build` works from a clean clone.

## Phase report format
At the end of each phase reply with:
1. What changed (files and commits).
2. Verification output summary (pass/fail per command).
3. Assumptions made.
4. What is next.

## Definition of done for the whole project
- All required flows work: list, filters, pinned today's follow-ups, timeline dialog, add note with follow-up, status update persists, add lead.
- All bonus items are done: search, overdue in red, Docker Compose, seed script with at least 6 leads and discussions.
- README has working setup steps, and an honest "AI usage" section.
- `git log` tells a clear story.
