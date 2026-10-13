# LeadFlow API contract

I define this document as the source of truth for both applications. The local base URL is `http://localhost:4000/api`. All request and response bodies use JSON and camelCase. Successful responses are the objects or arrays shown below, without a wrapper. There is no authentication or pagination.

## Types and normalization

`LeadStatus` is one of `new`, `contacted`, `qualified`, `proposal_sent`, `won`, `lost` (labels: New, Contacted, Qualified, Proposal Sent, Won, Lost).

| LeadSummary field | Type                  | Meaning                                   |
| ----------------- | --------------------- | ----------------------------------------- |
| id                | string                | 24 hexadecimal character MongoDB ObjectId |
| name              | string                | Trimmed, required, 1–120 characters       |
| company           | string or null        | Trimmed, at most 120 characters           |
| phone             | string or null        | Trimmed, at most 30 characters            |
| status            | LeadStatus            | Initially `new`                           |
| followUpAt        | ISO timestamp or null | Current follow-up                         |
| lastNote          | string or null        | Most recently saved discussion content    |
| lastDiscussionAt  | ISO timestamp or null | That discussion's creation time           |
| createdAt         | ISO timestamp         | Lead creation time                        |
| updatedAt         | ISO timestamp         | Last lead write                           |

| Discussion field | Type                  | Meaning                            |
| ---------------- | --------------------- | ---------------------------------- |
| id               | string                | ObjectId                           |
| leadId           | string                | Parent lead ObjectId               |
| content          | string                | Trimmed, 1–5000 characters         |
| kind             | `note` or `system`    | User note or creation entry        |
| followUpAt       | ISO timestamp or null | Follow-up recorded with this entry |
| createdAt        | ISO timestamp         | Discussion creation time           |

`LeadDetail` contains every `LeadSummary` field plus `discussions: Discussion[]`. Internal `_id` and `__v` fields are never exposed. Optional company and phone values may be omitted, null, empty, or whitespace-only; these normalize to null. Length limits apply after trimming.

Timestamp inputs must be valid ISO 8601 strings with seconds and an explicit timezone (`Z` or `±HH:MM`), such as `2026-10-13T14:00:00+05:30`. Outputs always use UTC `Z` with milliseconds. The API accepts past follow-ups; future-only form validation belongs to the frontend. Explicit null clears a follow-up; omission preserves it.

All mutation bodies are strict objects. Unknown fields, non-object bodies, missing required values, and incorrect types return 400. List query parameters are strict too; arrays/repeated parameters are invalid. IDs must contain exactly 24 hexadecimal characters, case-insensitively.

## Endpoints

| Method | Path relative to /api  | Success                    | Expected client errors |
| ------ | ---------------------- | -------------------------- | ---------------------- |
| GET    | /health                | 200 `{ "status": "ok" }`   | —                      |
| GET    | /leads                 | 200 `LeadSummary[]`        | 400                    |
| POST   | /leads                 | 201 `LeadSummary`          | 400                    |
| GET    | /leads/:id             | 200 `LeadDetail`           | 400, 404               |
| PATCH  | /leads/:id             | 200 `LeadSummary`          | 400, 404               |
| POST   | /leads/:id/discussions | 201 `{ discussion, lead }` | 400, 404               |

Unexpected errors may return 500 on any endpoint. Unsupported routes or HTTP methods return 404.

### GET /health

Request: `GET /api/health`. This is a liveness endpoint, not a database readiness check.

```json
{ "status": "ok" }
```

### GET /leads?status=&q=

Both parameters are optional. Omit `status` for all statuses; an empty or invalid status is a validation error. `q` is a trimmed string of at most 100 characters; an empty string means no search. Search matches name only, case-insensitively, as literal contains text with regex characters escaped. Status and search combine with AND.

Request: `GET /api/leads?status=new&q=sarah`

Response (200):

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Sarah Connor",
    "company": "Acme Corp",
    "phone": "555-0199",
    "status": "new",
    "followUpAt": null,
    "lastNote": "Lead created",
    "lastDiscussionAt": "2026-10-13T08:00:00.000Z",
    "createdAt": "2026-10-13T08:00:00.000Z",
    "updatedAt": "2026-10-13T08:00:00.000Z"
  }
]
```

The array is ordered by `lastDiscussionAt` descending, then internal ObjectId descending for ties. Null discussion times sort last. No matches return `[]`. Today's pinned section and overdue classification are computed by the frontend from this array; the API does not reorder follow-ups.

### POST /leads

Request:

```json
{ "name": " Sarah Connor ", "company": "Acme Corp", "phone": "555-0199" }
```

Only `name`, `company`, and `phone` are accepted. The minimal body is `{ "name": "Sarah Connor" }`. The response (201) is the LeadSummary object in the list example. The initial status is `new`, followUpAt is null, and I insert a `system` discussion with content `Lead created`, setting `lastNote` and `lastDiscussionAt` from it. If the system discussion write fails, I remove the newly inserted lead before returning an error.

### GET /leads/:id

Request: `GET /api/leads/507f1f77bcf86cd799439011`

Response (200):

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Sarah Connor",
  "company": "Acme Corp",
  "phone": "555-0199",
  "status": "new",
  "followUpAt": null,
  "lastNote": "Lead created",
  "lastDiscussionAt": "2026-10-13T08:00:00.000Z",
  "createdAt": "2026-10-13T08:00:00.000Z",
  "updatedAt": "2026-10-13T08:00:00.000Z",
  "discussions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "leadId": "507f1f77bcf86cd799439011",
      "content": "Lead created",
      "kind": "system",
      "followUpAt": null,
      "createdAt": "2026-10-13T08:00:00.000Z"
    }
  ]
}
```

Discussions are ordered by `createdAt` descending, then ObjectId descending for ties. A malformed ID returns 400; a valid but nonexistent ID returns 404.

### PATCH /leads/:id

Request: `PATCH /api/leads/507f1f77bcf86cd799439011`

```json
{ "status": "proposal_sent", "followUpAt": "2026-10-13T14:00:00+05:30" }
```

At least one of `status` or `followUpAt` is required. Both may be sent together. Follow-up clearing request: `{ "followUpAt": null }`. This endpoint does not add a discussion or change the last discussion fields.

Response (200):

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Sarah Connor",
  "company": "Acme Corp",
  "phone": "555-0199",
  "status": "proposal_sent",
  "followUpAt": "2026-10-13T08:30:00.000Z",
  "lastNote": "Lead created",
  "lastDiscussionAt": "2026-10-13T08:00:00.000Z",
  "createdAt": "2026-10-13T08:00:00.000Z",
  "updatedAt": "2026-10-13T08:10:00.000Z"
}
```

### POST /leads/:id/discussions

Request: `POST /api/leads/507f1f77bcf86cd799439011/discussions`

```json
{
  "content": "Sent pricing tier PDF.",
  "followUpAt": "2026-10-13T14:00:00+05:30"
}
```

Response (201):

```json
{
  "discussion": {
    "id": "507f1f77bcf86cd799439013",
    "leadId": "507f1f77bcf86cd799439011",
    "content": "Sent pricing tier PDF.",
    "kind": "note",
    "followUpAt": "2026-10-13T08:30:00.000Z",
    "createdAt": "2026-10-13T08:15:00.000Z"
  },
  "lead": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Sarah Connor",
    "company": "Acme Corp",
    "phone": "555-0199",
    "status": "proposal_sent",
    "followUpAt": "2026-10-13T08:30:00.000Z",
    "lastNote": "Sent pricing tier PDF.",
    "lastDiscussionAt": "2026-10-13T08:15:00.000Z",
    "createdAt": "2026-10-13T08:00:00.000Z",
    "updatedAt": "2026-10-13T08:15:00.000Z"
  }
}
```

The minimal request is `{ "content": "Called the lead." }`: it records discussion.followUpAt as null and leaves lead.followUpAt unchanged. Sending `followUpAt: null` records null and clears the lead's follow-up. `kind` is server-owned and always `note` for this endpoint.

I verify the parent exists, insert the discussion, and atomically update the lead's lastNote, lastDiscussionAt, and followUpAt only when provided. If that update fails, I delete the inserted discussion and rethrow. These compensated writes support standalone MongoDB, with no transaction guarantees across process crashes; overlapping notes use the last completed lead write for the summary.

## Error envelope

All errors share `{ "error": { "code", "message", "details"? } }`. Details appear only for validation errors and contain field paths and messages. Clients should depend on code and field, not exact human-readable wording. Root errors use `body` or `query`; malformed JSON and oversized JSON use `body`. Unknown keys identify the rejected field.

400 — invalid body, query, ObjectId, malformed JSON, or JSON over the 100kb limit:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [{ "field": "name", "message": "Name is required" }]
  }
}
```

404 — missing lead or unknown route:

```json
{ "error": { "code": "not_found", "message": "Lead not found" } }
```

500 — unexpected failure:

```json
{
  "error": {
    "code": "internal_error",
    "message": "An unexpected error occurred"
  }
}
```

I log unexpected failures internally; the response never contains stack traces, database diagnostics, credentials, or internal error messages. CORS exposes responses only to configured browser origins; requests without an Origin (such as curl) work normally.
