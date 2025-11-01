# Mail Merge Backend (Cloud Run)

Express handler for actions from the frontend. Implements `log_event` to append rows to a Google Sheet and prunes entries older than 30 days.

## Configure

Set environment variables on Cloud Run:
- `SHEET_ID`: the Google Sheet ID (from the URL)
- `SHEET_TAB`: sheet/tab name (default: `Logs`)

Grant your Cloud Run service account Editor access to the Sheet (share the Sheet with the service account email), or grant the specific Sheets scopes via IAM and ensure Application Default Credentials are used.

## Deploy

Build and deploy (from this `backend/` directory):

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/PROJECT_ID/mail-merge/backend:latest
gcloud run deploy mail-merge-backend \
  --image us-central1-docker.pkg.dev/PROJECT_ID/mail-merge/backend:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SHEET_ID=YOUR_SHEET_ID,SHEET_TAB=Logs
```

Alternatively, use Cloud Run deploy from source and specify env vars.

## API

POST `/` with JSON body:

- `action: "log_event"` with payload:
  ```json
  {
    "action": "log_event",
    "event": {
      "type": "send|preview|stats|...",
      "userEmail": "user@example.com",
      "status": "success|error",
      "message": "free text",
      "timestamp": "ISO-8601",
      "retention_days": 30,
      "meta": { "any": "json" }
    }
  }
  ```

Response: `{ "success": true }` or error.

Retention pruning runs best-effort after each append.



