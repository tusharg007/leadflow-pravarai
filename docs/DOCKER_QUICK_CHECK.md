# LeadFlow Docker quick-check video

I recorded all six requested checks on October 16, 2026, against production Docker images built from application commit `3b5f908`. I used automated Chromium interactions against the real frontend, Express API and MongoDB; I did not mock API responses or change application code.

[![Watch my Docker quick check](demo/docker-quick-check-poster.jpg)](https://github.com/tusharg007/leadflow-pravarai/releases/download/walkthrough-2026-10-16/docker-quick-check.mp4)

I provide the [GitHub MP4](https://github.com/tusharg007/leadflow-pravarai/releases/download/walkthrough-2026-10-16/docker-quick-check.mp4) and the [local MP4](demo/docker-quick-check.mp4). The video is **59.3 seconds**, **1600×900**, **30 fps**, H.264 and silent, with annotations burned into the frames. I trim setup and transitions, retain interactions at normal speed, and require no subtitle file. The GitHub repository is private, so its owner/account access is required.

## Results

- PASS — A note with a follow-up later today pins the lead without a reload.
- PASS — A status change survives a full browser reload (F5 equivalent).
- PASS — Add Lead rejects an empty name; a name-only lead appears as New.
- PASS — Bill marked Won uses a grey card and neutral follow-up chip, with no red Overdue label.
- PASS — At 360×640, date, time and Save Note fit inside the dialog; there is no horizontal overflow.
- PASS — Esc closes the dialog, clears the lead URL parameter and returns focus to its card.

## Video timings

| Time | Check                                          |
| ---- | ---------------------------------------------- |
| 0:00 | Docker quick check — six requested behaviours  |
| 0:03 | 1 / 6 — Add a note and a follow-up later today |
| 0:10 | PASS — Pinned immediately, with no reload      |
| 0:14 | 2 / 6 — Change status, then refresh (F5)       |
| 0:21 | 3 / 6 — Empty names are rejected               |
| 0:25 | PASS — A name alone creates a New lead         |
| 0:31 | 4 / 6 — Bill starts red while open             |
| 0:36 | PASS — Won is grey, never red                  |
| 0:40 | 5 / 6 — A real 360 × 640 viewport              |
| 0:44 | PASS — Date, time and Save Note stay reachable |
| 0:50 | 6 / 6 — Escape closes the dialog               |
| 0:53 | All six checks passed on the Docker build      |

## How I checked

I first rehearse all six checks, then reset only my dedicated test database and record a successful take. Both runs pass. I observe 21 successful browser API responses in the final take and zero unexpected browser errors or failed HTTP responses. Empty-name validation is an expected inline result and sends no create request.

I prove that pinning occurs without a reload by comparing a document identifier before and after saving. I prove reload persistence by checking that the document identifier changes after a full reload while the selected status and API record remain Contacted. I check that Bill retains his original past reminder while both his timeline and card use neutral styling after Won.

I stress the mobile dialog with a 120-character unbroken name, a 120-character unbroken company, a long phone number and a long note. I scroll each control into view, assert full viewport visibility and containment inside the dialog bounding box, check `document.documentElement.scrollWidth <= innerWidth`, then successfully save a note from that view.

![My 360px controls check](demo/docker-quick-check-mobile-360.png)

## Docker isolation and cleanup

I use `docker compose -p leadflow` with dedicated `quickcheck-mongo`, `quickcheck-backend` and `quickcheck-frontend` services. I build through the repository Dockerfiles, use the same production setup as the main compose file, and keep the shared network external. I use frontend port 3100 and API port 4100 because the existing Docker app occupies 3000/4000. MongoDB publishes no host port.

I seed using `npm run seed:prod -- --reset` inside my dedicated backend container. I change only the test database. After recording, I remove only the three containers and named data volume created for this check. I verify that the three original Docker containers retain their IDs and remain healthy; I leave their data, volumes and network intact.

I check the completed MP4 by decoding every frame and inspecting representative result frames. I detect no frozen intervals of eight seconds or longer. I verify that the uploaded GitHub asset SHA-256 matches the local video. I keep raw takes and temporary annotations under ignored `.cache/`.

I distinguish this automated browser check from a human personal review. I change no application code for this recording, so I do not repeat the unchanged unit-test gates.

I retain the [assertions, Docker image identities, API response statuses, cleanup and video verification](demo/docker-quick-check-verification.json). Video SHA-256: `11e55f0c2d2dade0553b5dde17cf2b557fa45ace91cab44d4a2b70d5ba421002`.
