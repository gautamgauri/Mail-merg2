# AI Mail Merge Assistant

A full-stack application for personalized email campaigns with AI assistance, built with React, Node.js, and Google Cloud.

## Project Structure

```
mail-merge-app/
├── frontend/          # React + Vite frontend application
│   ├── components/    # React components
│   ├── services/      # API and service integrations
│   ├── dist/          # Built frontend files
│   └── server.js      # Express server for serving frontend
├── backend/           # Node.js backend API
│   └── index.js       # Express API with email sending functionality
├── docs/              # Additional documentation
│   ├── CHECKLIST.md
│   ├── NGO_GUIDE.md
│   ├── SECURITY.md
│   └── USAGE_GUIDE.md
├── PRD.md             # Product Requirements Document
├── QUICK_START.md     # Quick reference guide
└── README.md          # This file
```

## Features

- **OAuth Authentication**: Sign in with Google
- **Email Personalization**: Use `{{placeholders}}` for dynamic content
- **AI Assistant**: Natural language commands for email operations
- **Preview Emails**: See personalized emails before sending
- **Send Emails**: Send via Gmail API with OAuth
- **Statistics**: Track sent emails and view logs
- **Google Sheets Integration**: Automatic logging of all email events

## Deployed Services

- **Frontend**: https://mail-merge-frontend-nerx6mrxvq-uw.a.run.app
- **Backend**: https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app
- **Logs Sheet**: https://docs.google.com/spreadsheets/d/1uQzxc-R8m0YZEReCKo70pfB-po7hWndB_AoO-Mwozok/edit

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

## Environment Variables

### Frontend (.env)
```
GOOGLE_CLIENT_ID=685272246909-h803s04kbdddqaupe2tvv3ro1elscrnk.apps.googleusercontent.com
BACKEND_URL=https://ai-mail-merge-assistant-nerx6mrxvq-uw.a.run.app
GEMINI_API_KEY=your-api-key-here
```

### Backend (Cloud Run Environment Variables)
```
SHEET_ID=1uQzxc-R8m0YZEReCKo70pfB-po7hWndB_AoO-Mwozok
SHEET_TAB=Sheet1
```

## Deployment

### Frontend
```bash
cd frontend
gcloud run deploy mail-merge-frontend --source . --region us-west1 --allow-unauthenticated --platform managed --project gen-lang-client-0307407360
```

### Backend
```bash
cd backend
gcloud run deploy ai-mail-merge-assistant --source . --region us-west1 --allow-unauthenticated --platform managed --project gen-lang-client-0307407360
```

## API Endpoints

### Backend API

- `POST /` with `action: "send"` - Send personalized emails
- `POST /` with `action: "preview"` - Preview personalized emails
- `POST /` with `action: "stats"` - Get email statistics
- `POST /` with `action: "log_event"` - Log an event to Google Sheets
- `POST /` with `action: "create_log_sheet"` - Create a new log sheet
- `POST /` with `action: "health"` - Health check

## Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Google APIs
- **Cloud**: Google Cloud Run, Cloud Build
- **Authentication**: Google OAuth 2.0
- **AI**: Google Gemini API

## Google Cloud Project

- **Project ID**: gen-lang-client-0307407360
- **Region**: us-west1

## License

Private - Diksha Foundation
