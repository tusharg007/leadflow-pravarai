# Unattended run prompt

I supplied this phase override after accepting Phases 0 and 1:

> UNATTENDED RUN. I am asleep and cannot answer questions. The earlier instruction to stop after each phase is lifted for this run only. Complete ALL remaining phases (2, 3a, 3b, 4, 5) from docs/ai/03_CODEX_MASTER_PROMPT.md in order, without stopping for review. Phases 0 and 1 are accepted (git tag phase1-accepted).

I required no questions, timestamped decisions/assumptions/failures/workarounds, simplest reasonable choices, gates after each phase and up to five repairs per distinct failure. I prohibited skipping/deleting tests, weakening strictness/lint, new auth/AI/pagination/features, history rewrites/reset, remote push, and changes to reference files or existing Docker resources/processes.

I required project `leadflow`, ports 4000/3000 unless occupied, no published MongoDB 27017, cross-platform scripts and labelled macOS/Linux examples. I specifically protected the existing `leadflow-mongo` container.

I requested cache/logging/CORP/CORS pre-flight fixes, all frontend features/tests from the master prompt, responsive/accessibility/error hardening, multi-stage non-root Docker services, complete environment examples, first-person README and honest AI usage.

I requested best-effort one-test Playwright persistence coverage and screenshot generation. I required final gates, README-only clean-clone Docker verification (or manual fallback), safe shutdown, no tracked secrets/reference files, and a report with per-phase results, assumptions, unresolved issues, exact run commands and morning checks.

I preserve complete detailed build requirements in [the master prompt](../03_CODEX_MASTER_PROMPT.md), [phase prompts](../04_CODEX_PHASE_PROMPTS.md), and [AGENTS.md](../../../AGENTS.md). This document records my unattended override and constraints.
