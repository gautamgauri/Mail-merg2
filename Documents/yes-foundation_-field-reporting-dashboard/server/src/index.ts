import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const app = express();

// Parse JSON bodies (including Base64 image)
app.use(express.json({ limit: '10mb' }));

// Environment configuration
const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'FormResponses';

if (!SHEET_ID) {
  // Log a warning at startup if SHEET_ID is missing – Cloud Run env var must be set.
  // We don't throw here to keep /health usable, but /api/case-records will fail clearly.
  console.warn('Warning: SHEET_ID environment variable is not set. Google Sheets writes will fail.');
}

type CaseRecordFormDataWithBase64Image = {
  facilitatorName: string;
  dateOfInterview: string;
  locationCenter: string;
  beneficiaryName: string;
  age: number;
  occupation: string;
  contactNumber?: string;
  sochLowHighRelevance: boolean;
  sochQuote: string;
  samajhSpecificRights: string[];
  samajhExplanation: string;
  samajhFacilitatorRating: string;
  samvaadActions: string[];
  samvaadStory: string;
  facilitatorNote: string;
  confidenceLevel: string;
  photoEvidence: string | null; // Base64 string or null
};

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// API endpoint used by the React app
app.post('/api/case-records', async (req: Request, res: Response) => {
  try {
    if (!SHEET_ID) {
      throw new Error('SHEET_ID environment variable is not set');
    }

    const body = req.body as CaseRecordFormDataWithBase64Image;

    const sheets = await getSheetsClient();

    const row = [
      new Date().toISOString(), // Timestamp
      body.facilitatorName,
      body.dateOfInterview,
      body.locationCenter,
      body.beneficiaryName,
      body.age,
      body.occupation,
      body.contactNumber ?? '',
      body.sochLowHighRelevance,
      body.sochQuote,
      (body.samajhSpecificRights || []).join(', '),
      body.samajhExplanation,
      body.samajhFacilitatorRating,
      (body.samvaadActions || []).join(', '),
      body.samvaadStory,
      body.facilitatorNote,
      body.confidenceLevel,
      body.photoEvidence ?? '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error submitting case record:', err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
  }
});

// Simple health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    sheetConfigured: Boolean(SHEET_ID),
    sheetName: SHEET_NAME,
  });
});

// Serve the built Vite frontend from /dist
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../dist');

app.use(express.static(distPath));

// SPA fallback: any non-API route should serve index.html
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Fullstack app listening on port ${port}`);
  console.log(`Serving frontend from: ${distPath}`);
  console.log(`Google Sheets ID set: ${Boolean(SHEET_ID)}`);
  console.log(`Google Sheets sheet name: ${SHEET_NAME}`);
});


