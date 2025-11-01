## Product Requirements Document (PRD): AI Mail Merge Assistant

- **Product name**: AI Mail Merge Assistant
- **Goal**: Enable non-technical users to create, personalize, preview, and send bulk emails with AI assistance, while logging key events to Google Sheets for one-month retention and optionally importing contacts from Google Contacts.

### Personas
- **Campaign Owner**: crafts templates, filters recipients, triggers sends.
- **Team Lead/Manager**: reviews previews/stats, audits logs.
- **Ops/Admin**: configures backend URL, credentials, and access.

### Success metrics
- **Primary**: time to first send, preview-to-send conversion rate.
- **Secondary**: send errors per 1000 emails, assistant command success rate, % events logged to Sheets.

### Key user journeys
- Import recipients (CSV/manual or Google Contacts) → Insert placeholders → AI enhance → Preview → Send → Review stats/logs.
- Ask assistant: “preview emails”, “get stats”, “send to unsent”, “draft follow-up”.

### Functional requirements
- **Recipient data**
  - CSV paste/upload with header row.
  - Manual table entry (add/remove rows/columns).
  - Import from Google Contacts (People API): map to `[Email, Name]`.
- **Template**
  - Subject/body with `{{placeholders}}` from headers.
  - Placeholder picker UI from parsed headers.
  - AI enhancement (Gemini) with prompt.
- **Preview and export**
  - Render merged outputs list.
  - Export as text/CSV/HTML; copy to clipboard; CSV download.
- **Assistant**
  - Commands: `get_stats`, `preview_emails`, `send_emails`, `draft_email`.
  - Settings UI for Backend URL.
  - Apply “Use this draft” to editor.
- **Send**
  - Gmail send via backend with OAuth access token (GIS).
  - Block send if not signed in or backend missing.
- **Event logging (one-month memory)**
  - Log events: `send`, `preview`, `stats`, errors; fields: timestamp, userEmail, action, status, message, meta.
  - Backend enforces retention: auto-prune entries older than 30 days.
  - Best-effort logs; UI not blocked on log failures.
- **Auth**
  - Google Identity Services: One Tap + OAuth token for Gmail send and People API read-only.

### Non-functional requirements
- **Security**: least-privilege scopes; no secrets in repo; HTTPS only; sanitize preview content (avoid XSS).
- **Performance**: previews for first N rows quickly; responsive UI on 1–2k contacts.
- **Reliability**: retries on transient backend/network errors; clear error messaging.

### Scoping and constraints
- Out of scope v1: scheduling, A/B testing, bounce tracking, rich WYSIWYG editor, multi-user roles, attachments.
- Single Google account per session.

### Data model (frontend)
- `Recipient`: `{ [header: string]: string }`
- `ChatMessage`: `{ id, sender, text, data? }`
- `AuthState`: `{ isLoggedIn, userProfile? }`

### Integrations
- **Gemini API**: prompt-based enhancement and tool-calling.
- **Gmail send (backend)**: backend uses user OAuth token for sending.
- **People API**: `contacts.readonly` for importing contacts.
- **Google Sheets (backend)**: append event rows; retention policy.

### Backend contracts (Cloud Run / Apps Script)
- Endpoint accepts JSON: `{ action, ...params }`
- Actions:
  - `stats`: returns object of counts/summary.
  - `preview`: returns array of `{ to, subject, body }` (filtered by optional `filter`, `count`).
  - `send`: sends emails (optional `filter`); requires `Authorization: Bearer <userAccessToken>`.
  - `log_event`: appends to Google Sheet:
    - Input: `{ event: { type, userEmail, status, message, timestamp, retention_days, meta } }`
    - Behavior: prune rows older than 30 days (or `retention_days`).
- Errors: `{ success:false, error:string }` with non-2xx also logging server-side.

### Assistant tool definitions (AI)
- `get_stats({})`
- `preview_emails({ filter?: string, count?: number })`
- `send_emails({ filter?: string })`
- `draft_email({ prompt: string, current_body?: string })`

### UX details
- DataInput: two tabs (CSV/Manual) + “Import from Google Contacts” button.
- TemplateEditor: headers-to-placeholders chips; AI prompt input + Enhance.
- Preview: merged list + modal with export tabs (text/CSV/HTML).
- Assistant: chat dock; settings for Backend URL; renderers for stats/preview/draft; apply draft button.

### Security and privacy
- OAuth scopes:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/contacts.readonly`
- Sheet access:
  - Backend service account or user token; Sheet shared appropriately.
- PII: store only necessary fields; delete logs >30 days.

### Rollout plan
- Phase 1: Sheets logging backend; frontend logging hooks; manual deploy.
- Phase 2: Google Contacts import; add People API scope; UX polish.
- Phase 3: CI/CD to Cloud Run main; observability (basic logs/alerts).

### Risks and mitigations
- OAuth scope/consent friction: show inline helper text; request on demand.
- Backend URL misconfig: assistant warns/blocks; settings modal always accessible.
- CSV parsing edge-cases: consider Papa Parse later if needed.
- XSS in previews: render text; avoid innerHTML or sanitize.

### Open questions
- Which filters are supported by backend for `preview`/`send`?
- Sheet schema and tab name for logs?
- Need an admin view to review logs in-app, or Sheet is sufficient v1?



