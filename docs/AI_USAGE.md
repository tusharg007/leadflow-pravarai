# AI usage

## Tools

- Claude (Anthropic): planning, prompt drafting, and review of the delivered code and test evidence.
- OpenAI Codex (desktop app): code generation, tests, Docker setup, documentation and the demo recordings.

## Workflow

1. Inputs: the assignment, the wireframes and a UI boilerplate (style reference only).
2. A written plan and API contract (`docs/ai/01_IMPLEMENTATION_PLAN.md`, `docs/API.md`) and standing rules (`AGENTS.md`) were fixed before code generation.
3. Codex built the backend first, then the frontend, Docker setup and docs in phases. Each phase had to pass lint, typecheck, tests and build. Phases 2 to 5 ran as one extended non-interactive session; I reviewed the result afterwards.
4. I ran the app myself (Docker setup, seed, API error cases, browser) and sent independent review findings back for fixes.

## What the AI generated

Most of the source code, tests, Dockerfiles, seed script and documentation. The demo videos are automated recordings. The app itself has no AI features.

## Review findings fixed after generation

- Seed follow-ups depended on the server timezone; they are now relative to the current time.
- The timeline dialog clipped its controls on small screens with very long names; the title is now clamped and the dialog scrolls.
- Past-due follow-ups earlier today were not shown as overdue; they now show red while staying pinned.
- Closed (Won/Lost) leads showed red overdue chips; they now show a neutral chip.
- GET requests sent a JSON content type and triggered CORS preflights; the header is now sent only with a body.

## Prompts and logs

The plan, master prompt and phase prompts are in `docs/ai/`. Run logs from the long session are in `docs/ai/run-logs/`.
