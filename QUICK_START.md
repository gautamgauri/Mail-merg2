# Quick Start Guide

## Project Location
```
C:\Users\gauta\mail-merge-app
```

## Folder Structure
```
mail-merge-app/
├── frontend/     # React frontend
├── backend/      # Node.js API
└── README.md     # Full documentation
```

## Deployed URLs

✅ **Frontend**: https://mail-merge-frontend-nerx6mrxvq-uw.a.run.app
✅ **Backend**: https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app
✅ **Logs**: https://docs.google.com/spreadsheets/d/1uQzxc-R8m0YZEReCKo70pfB-po7hWndB_AoO-Mwozok/edit

## Quick Deploy Commands

### Deploy Frontend
```bash
cd C:\Users\gauta\mail-merge-app\frontend
npm run build
gcloud run deploy mail-merge-frontend --source . --region us-west1 --allow-unauthenticated --platform managed --project gen-lang-client-0307407360
```

### Deploy Backend
```bash
cd C:\Users\gauta\mail-merge-app\backend
gcloud run deploy ai-mail-merge-assistant --source . --region us-west1 --allow-unauthenticated --platform managed --project gen-lang-client-0307407360
```

## Local Development

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

### Run Backend Locally
```bash
cd backend
npm install
npm start
# Runs on http://localhost:8080
```

## Configuration Files

### Frontend: `.env`
```
GOOGLE_CLIENT_ID=685272246909-h803s04kbdddqaupe2tvv3ro1elscrnk.apps.googleusercontent.com
BACKEND_URL=https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app
GEMINI_API_KEY=
```

### Backend: Cloud Run Environment
- `SHEET_ID=1uQzxc-R8m0YZEReCKo70pfB-po7hWndB_AoO-Mwozok`
- `SHEET_TAB=Sheet1`

## Features Working

✅ OAuth Google Sign-In
✅ Email Preview
✅ Email Sending via Gmail API
✅ Statistics Dashboard
✅ Auto-logging to Google Sheets
✅ AI Assistant Commands

## Google Cloud Project

- **Project ID**: `gen-lang-client-0307407360`
- **Region**: `us-west1`
- **Service Account**: `685272246909-compute@developer.gserviceaccount.com`

## Important Notes

1. The OAuth Client ID is configured for:
   - Production: `https://mail-merge-frontend-nerx6mrxvq-uw.a.run.app`
   - Local: `http://localhost:3000`

2. Backend has Editor permissions on the Google Sheet for logging

3. Email sending uses user's Gmail account via OAuth token

## Support

For issues or questions, check the main README.md file.
