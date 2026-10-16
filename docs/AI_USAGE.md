# AI usage

I used OpenAI Codex in the desktop app for all phases. I supplied `AGENTS.md`, the master prompt, implementation plan, and local assessment/wireframes. I initially constrained work to Phases 0 and 1, then authorized an unattended run for Phases 2–5.

Codex generated the hygiene files, API documentation, backend configuration, Mongoose models, Zod validation, service and HTTP layers, centralized error handling, tests, seed data, and setup documentation. It verified npm package versions, generated the lockfile, ran automated checks, and created the local Conventional Commits. It inspected the boilerplate ZIP as a style reference without copying its application features.

Codex also generated the Next.js frontend, Radix primitives, TanStack Query caches, forms, URL state, MSW tests, browser smoke/screenshot tools and Docker delivery. It corrected logging/CORS, abort handling, strict optional typing, font resolution, responsive truncation and runner compatibility while verifying the implementation.

Codex performed the recorded checks and browser verification, and the videos are automated recordings. I ran the Docker setup, seed and API error checks myself and viewed the app in the browser. I have no AI features in the app. I record the unattended scope in [the run prompt](codex/07_UNATTENDED_RUN_PROMPT.md), decisions in [the log](codex/AUTONOMOUS_RUN_LOG.md), and results in [the report](codex/06_AUTONOMOUS_RUN_REPORT.md).

## Direct implementation prompt

I used this prompt for the current work:

```text
Read AGENTS.md and docs/codex/03_CODEX_MASTER_PROMPT.md completely, then docs/codex/01_IMPLEMENTATION_PLAN.md, reference/ASSIGNMENT.md and the images in reference/wireframes/. Confirm you have read them in two sentences.

Then do Phase 0 and Phase 1 only:
- Phase 0: repo hygiene (.gitignore, .editorconfig, .gitattributes, root README skeleton, .env.example skeleton) and write docs/API.md (the full contract, with request/response examples and the error envelope).
- Phase 1: the Express + TypeScript + Mongoose backend with tests and the seed script, committed in logical Conventional Commits (config + app skeleton; models; schemas + validation; services + routes; error handling; tests; seed).

Run the verification gates from AGENTS.md, then report in the phase report format.
```

I keep complete copies of the additional build instructions in [AGENTS.md](../AGENTS.md), [the master prompt](codex/03_CODEX_MASTER_PROMPT.md), and [the implementation plan](codex/01_IMPLEMENTATION_PLAN.md). My `reference/` directory remains read-only and excluded from Git.
