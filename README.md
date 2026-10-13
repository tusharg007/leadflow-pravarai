# LeadFlow

I am building a single-screen lead management tool for a Fullstack Intern assessment. I use Next.js, Express, TypeScript, and MongoDB to track leads, discussion history, and follow-ups.

## Project status

I am implementing Phase 0 (repository setup and API contract) and Phase 1 (backend). I will add the frontend in Phases 2–3 and Docker Compose in Phase 5.

## Setup

I document the backend setup here as soon as Phase 1 is verified. I will add frontend and Docker instructions when those phases are implemented.

## API and architecture

I define the HTTP contract in [docs/API.md](docs/API.md). My backend separates routes, controllers, services, and Mongoose models. I keep the reference assignment and screenshots local and excluded from Git.

## Assumptions

- I store and transport timestamps in UTC; I will calculate follow-up buckets in the browser's local timezone.
- I will show today's follow-ups only in the pinned section.
- I preserve a lead's follow-up when a note omits `followUpAt`; explicit `null` clears it.
- I keep the list unpaginated because I expect a small assessment dataset.
- I use compensated writes instead of transactions so the backend works with standalone MongoDB.
- I omit authentication as directed by the project brief.
- I treat all mutation bodies and list query parameters as strict objects, rejecting unknown keys and repeated query values.
- I accept only name, company, and phone when creating a lead; its initial status is always New.
- I use the available assignment copy at `reference/06_ASSIGNMENT_REFERENCE.md`; the requested `reference/ASSIGNMENT.md` is absent.

## Known trade-offs

I cannot guarantee cross-collection atomicity across process crashes without MongoDB transactions. I will document seed semantics and runtime limitations after backend verification.

## Testing

I will run and record lint, typecheck, tests, and build for every implemented app. I will not claim frontend or Docker checks pass before those applications exist.

## Screenshots and demo

I will add screenshots and a demo video after the frontend is ready.

## AI usage

I used OpenAI Codex to read the assessment, define the API contract, scaffold the repository, and implement and test the backend. Codex performed the automated checks reported in this repository; I still need to complete my own review and browser walkthrough before submission.
