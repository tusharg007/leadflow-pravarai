# LeadFlow annotated walkthrough

Automated, annotated Playwright/Chromium recording of the compiled Next.js client, the Express API and an isolated MongoDB 7 instance, recorded from commit `efd43ac`. It is not a manual screen capture. No product code was changed for the recording and no production data was used.

A [focused Docker quick-check video covers the six requested review checks](DOCKER_QUICK_CHECK.md).

[![Watch the LeadFlow walkthrough](demo/walkthrough-poster.jpg)](https://github.com/tusharg007/leadflow-pravarai/releases/tag/walkthrough-2026-10-16)

The [GitHub video release](https://github.com/tusharg007/leadflow-pravarai/releases/tag/walkthrough-2026-10-16) and a [repository copy of the MP4](demo/leadflow-walkthrough.mp4) contain the recording made on October 16, 2026. The video is **3:24**, **1600×900**, **30 fps**, H.264, and silent. All explanations are burned into a separate annotation band below the app; no subtitle file is required. Codex trimmed setup and transitions while retaining actions at normal speed and short result-reading holds. No production/user data was used.

## Chapters

| Time | Feature                                         |
| ---- | ----------------------------------------------- |
| 0:00 | LeadFlow — the complete lead workflow           |
| 0:04 | Prioritize today; keep the rest in order        |
| 0:10 | All six status filters                          |
| 0:20 | Search case-insensitively                       |
| 0:23 | Combine filters and search                      |
| 0:28 | Literal search and a clear empty state          |
| 0:34 | Open the full discussion timeline               |
| 0:40 | Save a discussion without changing the reminder |
| 0:49 | Schedule a follow-up from a discussion          |
| 0:58 | The lead moves into Today immediately           |
| 1:02 | Earlier today is overdue — and still pinned     |
| 1:11 | Close a lead without showing a false alarm      |
| 1:18 | Status and history persist after reload         |
| 1:26 | Clear the reminder; keep the discussion history |
| 1:31 | Won leads are neutral too                       |
| 1:41 | Create a lead — required fields are guarded     |
| 1:47 | Add a complete contact                          |
| 1:58 | Date and time are required together             |
| 2:05 | Correct the form and save a future reminder     |
| 2:10 | Optional contact details stay optional          |
| 2:17 | Shareable URL state and a persistent dialog     |
| 2:23 | Keyboard-friendly dialogs                       |
| 2:28 | Loading states on a slower connection           |
| 2:33 | Retry recovers from a network interruption      |
| 2:40 | Browser timezone: America/Los_Angeles           |
| 2:44 | Browser timezone: Pacific/Auckland              |
| 2:48 | The API contract is verified too                |
| 2:54 | A responsive single-screen workflow             |
| 2:59 | Long names and notes do not hide the form       |
| 3:03 | The footer stays reachable on small screens     |
| 3:13 | A clean empty instance is ready to use          |
| 3:17 | Verified architecture and delivery              |

## Verified behaviour

- All six status filters, combined filter/search state, mixed-case search and literal punctuation, no-results and empty-instance states were exercised.
- Checks covered newest-first discussion history, italic system entries, note-only follow-up preservation, immediate pinned movement, elapsed-time overdue styling, clear follow-up and reload persistence.
- Open, Lost and Won reminders were compared using real mutations. Closed reminders are neutral; pinning still follows the local calendar day.
- Both a complete contact and a name-only contact were created; required-name and date/time validation were checked, the form was corrected, and a future reminder was saved.
- Checks covered URL deep links, keyboard focus trapping/return, real-response loading skeletons and recovery after a controlled browser-network interruption.
- Local-day membership was checked in Los Angeles and Auckland using the same stored UTC timestamps. Mobile interactions were checked at 360×640 and dialog bounds at both 360×640 and 320×568 with 120-character name/company and a 5,000-character note.
- Actual API success responses and the validation/not-found error envelope were verified. The API result card displays captured response data.
- Lint, strict typecheck, tests, build and format checks ran in both apps before filming: **68 backend tests** and **49 frontend tests** passed. The completed rehearsal and final recording had **zero unexpected browser errors**.

## Recording decisions

The configured GitHub origin was absent, so `tusharg007/leadflow-pravarai` was created as a private repository for publication. The video, poster and verification record were retained in the local repository, and the MP4 was published as a GitHub release asset. Automatic approval review rejected a full source-history push, so this recording task published only a video index and the requested MP4.

Search queries and discussion text serve as test inputs because LeadFlow has no AI prompting feature. Codex labels intentional invalid-form, delayed-response and network-interruption scenarios in the video; they demonstrate expected validation/recovery behavior. Only the disposable demo database was cleared for the empty-instance chapter, then discarded after the recording.

A relative-time display issue found during video review was corrected: a newly saved discussion could be newer than the list's cached clock and briefly read as future time. Discussion ages are clamped to the cached present, and regression tests were added before recording the final take.

Ports 3100/4100 were used because existing services occupied 3000/4000. Every browser, server and temporary database process started for the recording was stopped, leaving the existing Docker resources untouched. Raw footage, working annotation files and rehearsal assets remain under ignored `.cache/video/`; only the finished MP4, poster and verification record are committed.

This automated recording is distinct from personal review. The existing personal-review and submission-video wording in `README.md` and `docs/AI_USAGE.md` was preserved during the recording task.

[Chapter timings, source provenance and captured API checks](demo/walkthrough-verification.json) are retained. Video SHA-256: `4ef82cdb5a988324cf0f9429bc10ea8269228b97b3dbd45312a02fae8b50edfe`.
