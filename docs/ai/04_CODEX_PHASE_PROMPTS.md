# LeadFlow — Phase Prompts

Send these to Codex one at a time. After each phase, review the output and run the app yourself before sending the next message.

## Kickoff (send first)

```
Read AGENTS.md and docs/ai/03_CODEX_MASTER_PROMPT.md completely, then docs/ai/01_IMPLEMENTATION_PLAN.md, reference/ASSIGNMENT.md and the images in reference/wireframes/. Confirm you have read them in two sentences.

Then do Phase 0 and Phase 1 only:
- Phase 0: repo hygiene (.gitignore, .editorconfig, .gitattributes, root README skeleton, .env.example skeleton) and write docs/API.md (the full contract, with request/response examples and the error envelope).
- Phase 1: the Express + TypeScript + Mongoose backend with tests and the seed script, committed in logical Conventional Commits (config + app skeleton; models; schemas + validation; services + routes; error handling; tests; seed).

Run the verification gates from AGENTS.md, then report in the phase report format.
```

## Phase 2 + 3a (after Phase 1 review)

```
Phase 1 is accepted. Proceed with Phase 2 and Phase 3a.

Phase 2: frontend foundation. Scaffold Next.js (App Router, TypeScript strict, Tailwind v4) in frontend/. Add design tokens ported from the boilerplate approach, Inter via next/font, the ui primitives (Button, Badge, Input, Textarea, Select, Dialog on Radix, Skeleton, Spinner, Toaster), the typed API client with ApiError and Zod-validated responses, types mirroring docs/API.md, providers (QueryClient, Toaster), and lib/cn.ts and lib/env.ts.

Phase 3a: the lead list. LeadScreen, Header, StatusFilter, LeadSearch (debounced), LeadList, LeadCard, StatusBadge, FollowUpChip, skeleton/empty/error states, URL state for filter and search, followUp.ts (classify, partition) with unit tests, and useNow(60_000). Today's follow-ups pinned at the top; overdue chip in red; Won/Lost dimmed.

Commit in logical Conventional Commits. Run the frontend verification gates and report. Tell me the exact commands to run backend and frontend together so I can check it in the browser.
```

## Phase 3b (after 3a review)

```
Phase 3a is accepted. Proceed with Phase 3b.

Build AddLeadDialog (react-hook-form + Zod, name required, company and phone optional, status defaults to New, server errors mapped to fields), LeadTimelineDialog (header with name, company, phone; StatusSelect; Timeline with newest-first entries; follow-up chips; system entries in italics; DiscussionForm pinned in the footer; Clear follow-up action), and the mutation hooks (useCreateLead, useAddDiscussion, useUpdateLead) with the cache-update behaviour from the master prompt: add note with follow-up moves the lead into the pinned section immediately, status change is optimistic with rollback, add lead appears immediately. The open lead id lives in the URL (?lead=<id>).

Add the integration tests listed in the master prompt (MSW). Commit in logical Conventional Commits, run the frontend gates, and report.
```

## Phase 4 (after 3b review)

```
Phase 3b is accepted. Proceed with Phase 4: hardening.

1. Accessibility pass: focus order in both dialogs, Esc and overlay close, labels, aria-pressed on chips, aria-live on errors, keyboard-only walkthrough, contrast.
2. Responsive pass: 360px, 768px, 1280px+. Chips scroll horizontally on mobile; dialogs fit small screens with a scrolling body and fixed header/footer.
3. Edge cases: very long names and notes (truncate with title tooltip in the list), no leads, no results for a filter or search, API down (error state with retry), slow network (skeletons), double-submit prevention.
4. Backend: confirm every error path returns the envelope; add any missing tests; make sure no stack traces leak.
5. Lint, typecheck, format clean in both apps. Remove dead code and stray console.log.

Commit in logical Conventional Commits, run both sets of gates, and report anything you chose not to fix and why.
```

## Phase 5 (after Phase 4 review)

```
Phase 4 is accepted. Proceed with Phase 5: delivery.

1. docker-compose.yml with mongo (healthcheck), backend, frontend, plus the two Dockerfiles (multi-stage, non-root backend, Next.js standalone output, NEXT_PUBLIC_API_URL as a build arg).
2. .env.example at root, backend/ and frontend/, every variable documented.
3. Seed works in Docker: `docker compose exec backend npm run seed:prod`.
4. README.md per the master prompt, including quick start (Docker), manual start for Windows PowerShell and macOS/Linux, env table, API table with curl examples, architecture, assumptions, known trade-offs, testing, and an honest "AI usage" section, all in first person singular. Leave clearly marked placeholders for screenshots and the demo video link.
5. docs/AI_USAGE.md, including a copy of the prompts used.
6. Clean-clone verification: clone the repo into a temp folder, follow ONLY the README, and confirm `docker compose up --build` works and the seed produces one follow-up today, one overdue, and one upcoming. Report exactly what you ran and what you saw. If Docker is unavailable in this environment, say so and verify the manual path instead.

Commit in logical Conventional Commits and report.
```

## Fix-up prompt (use when a gate fails or a review finds an issue)

```
The following issue remains: <paste the failing command output or describe the bug and how to reproduce it>.
Find the root cause, fix it with the smallest sensible change, add or adjust a test that would have caught it, run the relevant gates, and commit with a `fix:` message. Report the root cause in one or two sentences.
```

## Review prompt (optional second pass at the very end)

```
Act as a strict reviewer of this repository as the hiring team would. Check against reference/ASSIGNMENT.md's evaluation matrix item by item (functional, code quality, delivery, bonus). For each item, say pass or fail with the file and line that proves it. List any risks (timezone handling, error envelope consistency, README accuracy, leaked secrets). Do not change code; produce a prioritized list of fixes.
```
