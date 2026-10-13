# AI usage

I used OpenAI Codex in the desktop app for Phases 0 and 1. I supplied the standing instructions in `AGENTS.md`, the master prompt and implementation plan in `docs/codex/`, and the local assessment and wireframes. I constrained the work to the contract, repository hygiene, and backend.

Codex generated the hygiene files, API documentation, backend configuration, Mongoose models, Zod validation, service and HTTP layers, centralized error handling, tests, seed data, and setup documentation. It verified npm package versions, generated the lockfile, ran automated checks, and created the local Conventional Commits. It inspected the boilerplate ZIP as a style reference without copying its application features.

I distinguish automated checks from personal review: the recorded verification was performed by Codex, and I have not yet completed my own code review or frontend walkthrough. I will update this document after later phases and my final review. I have no AI features in the application itself.

## Direct implementation prompt

I used this prompt for the current work:

```text
Read AGENTS.md and docs/codex/03_CODEX_MASTER_PROMPT.md completely, then docs/codex/01_IMPLEMENTATION_PLAN.md, reference/ASSIGNMENT.md and the images in reference/wireframes/. Confirm you have read them in two sentences.

Then do Phase 0 and Phase 1 only:
- Phase 0: repo hygiene (.gitignore, .editorconfig, .gitattributes, root README skeleton, .env.example skeleton) and write docs/API.md (the full contract, with request/response examples and the error envelope).
- Phase 1: the Express + TypeScript + Mongoose backend with tests and the seed script, committed in logical Conventional Commits (config + app skeleton; models; schemas + validation; services + routes; error handling; tests; seed).

Run the verification gates from AGENTS.md, then report in the phase report format.
```

I keep complete copies of the additional build instructions in [AGENTS.md](../AGENTS.md), [the master prompt](codex/03_CODEX_MASTER_PROMPT.md), and [the implementation plan](codex/01_IMPLEMENTATION_PLAN.md). The requested assignment path was absent, so Codex read the existing `reference/06_ASSIGNMENT_REFERENCE.md` without altering it. My `reference/` directory remains read-only and excluded from Git.
