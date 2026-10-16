# LeadFlow Docker quick-check video

Automated, annotated Playwright/Chromium recording of the compiled Next.js client, the Express API and an isolated MongoDB 7 instance, recorded from commit `91bc269`. It is not a manual screen capture. No product code was changed for the recording and no production data was used.

[![Watch the Codex-generated Docker quick check](demo/docker-quick-check-poster.jpg)](demo/docker-quick-check.mp4)

The [current repository MP4](demo/docker-quick-check.mp4) was regenerated on October 16, 2026, with changes limited to the presentation and its evidence files. It is **72.6 seconds**, **1600×900**, **30 fps**, H.264 and silent. Codex burns annotations into the frames, retains interactions at normal speed and trims setup and unrecorded transitions. No subtitle file is required. The GitHub release page may hold an earlier revision of this clip; the file in this repository is current.

## Results

- PASS — A note with a follow-up later today pins the lead without a reload.
- PASS — A status change survives a full browser reload (F5 equivalent).
- PASS — Add Lead rejects an empty name; a name-only lead appears as New.
- PASS — Bill marked Won uses a grey card and neutral follow-up chip.
- PASS — At 360×640, date, time and Save Note are reachable with no horizontal overflow.
- PASS — Esc closes the dialog and returns focus to Diana.

## Video timings

| Time | Card or action                                  |
| ---- | ----------------------------------------------- |
| 0:00 | Docker quick check — six requested behaviours   |
| 0:03 | CHECK 1 / 6 — Note + follow-up later today      |
| 0:10 | PASS 1 / 6 — Pinned immediately, no reload      |
| 0:14 | CHECK 2 / 6 — Status survives F5                |
| 0:19 | BEFORE F5 — Diana: Contacted                    |
| 0:22 | F5 — Full browser reload                        |
| 0:23 | PASS 2 / 6 — AFTER F5: Diana is still Contacted |
| 0:27 | CHECK 3a / 6 — Reject an empty name             |
| 0:29 | PASS 3a / 6 — Empty name rejected               |
| 0:33 | CHECK 3b / 6 — Create with a name only          |
| 0:36 | PASS 3b / 6 — Name-only lead appears as New     |
| 0:40 | CHECK 4 / 6 — Won must be neutral               |
| 0:45 | PASS 4 / 6 — Bill is Won, grey, never red       |
| 0:50 | CHECK 5 / 6 — Controls at 360 × 640             |
| 0:53 | PASS 5 / 6 — Controls reachable; no overflow    |
| 1:01 | CHECK 6 / 6 — Esc closes the dialog             |
| 1:03 | PASS 6 / 6 — Esc closed the dialog              |
| 1:07 | All six checks passed on the Docker build       |

## Visible F5 evidence

Codex holds Diana's actual Contacted badge on screen before the reload and again afterward. The document identifier change and the API record remaining Contacted are verified.

![Diana before F5](demo/docker-quick-check-f5-before.png)

![Diana after F5](demo/docker-quick-check-f5-after.png)

## Mobile scope

The check uses a real 360×640 viewport with a 120-character unbroken name and company. Date, time and Save Note are scrolled into view; full viewport visibility and containment inside the dialog are asserted, `document.documentElement.scrollWidth <= innerWidth` is checked, and a note is saved successfully. This clip makes no claim about responsive filter interactions or testing the full discussion history.

![360px controls check](demo/docker-quick-check-mobile-360.png)

## Verification and isolation

All six checks passed in rehearsal and in the recorded take, with 21 successful browser API responses and no unexpected browser errors or failed HTTP responses. Seven CHECK/PASS pairs were verified because the third check has two separate cases. The complete video was decoded and its result frames inspected; no frozen intervals of eight seconds or longer were detected.

A separate `leadflow-video` Compose project was built through the unchanged repository Dockerfiles, using frontend port 3100 and API port 4100. MongoDB uses temporary in-memory storage and publishes no host port. Only this isolated database was seeded, then only this isolated project was shut down, without any volume-removal command.

The original `leadflow` project was verified to retain its container IDs and identical lead/discussion data. No destructive commands were run against its volume. Recording helpers and raw takes remain under ignored `.cache/`.

This automated browser recording is distinct from a human personal review. The unchanged application unit-test gates were not rerun for this presentation-only change.

The [check results, presentation inventory, Docker provenance and cleanup verification](demo/docker-quick-check-verification.json) are retained. Video SHA-256: `c96b64dafdc95305f7aee7ddf58cd8c46adcc67a779f855d95a75bc41ff06036`.
