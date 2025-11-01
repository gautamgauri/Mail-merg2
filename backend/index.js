import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8080;
const SHEET_ID = process.env.SHEET_ID || '';
const SHEET_TAB = process.env.SHEET_TAB || 'Logs';

function requireSheetConfig() {
  if (!SHEET_ID) {
    throw new Error('Missing SHEET_ID env');
  }
}

async function getSheetsClient() {
  // Uses ADC on Cloud Run. Ensure the service account has access to the Sheet.
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ];
  const auth = await google.auth.getClient({ scopes });
  return { sheets: google.sheets({ version: 'v4', auth }), drive: google.drive({ version: 'v3', auth }) };
}

function toIso(value) {
  if (!value) return new Date().toISOString();
  try { return new Date(value).toISOString(); } catch { return new Date().toISOString(); }
}

async function appendLogRow(event) {
  requireSheetConfig();
  const { sheets } = await getSheetsClient();
  const values = [[
    toIso(event.timestamp),
    event.userEmail || '',
    event.sentTo || '',
    event.type || '',
    event.status || '',
    event.message || '',
    event.retention_days ?? 30,
    JSON.stringify(event.meta ?? null)
  ]];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A:H`,
    valueInputOption: 'RAW',
    requestBody: { values }
  });
}

async function pruneOldRows(retentionDays = 30) {
  requireSheetConfig();
  const { sheets } = await getSheetsClient();
  const now = Date.now();
  const ms = retentionDays * 24 * 60 * 60 * 1000;

  // Read timestamps from column A (skip header at row 1)
  const read = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A2:A`
  });
  const rows = read.data.values || [];
  if (rows.length === 0) return;

  const toDeleteZeroBased = [];
  for (let i = 0; i < rows.length; i++) {
    const ts = rows[i][0];
    const t = Date.parse(ts);
    if (!isNaN(t) && (now - t) > ms) {
      // +1 to account for header, and zero-based index expected by deleteDimension
      toDeleteZeroBased.push(i + 1);
    }
  }
  if (toDeleteZeroBased.length === 0) return;

  // Build contiguous ranges to minimize requests
  toDeleteZeroBased.sort((a, b) => a - b);
  const ranges = [];
  let start = toDeleteZeroBased[0];
  let prev = start;
  for (let i = 1; i < toDeleteZeroBased.length; i++) {
    const cur = toDeleteZeroBased[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      ranges.push({ start, end: prev });
      start = prev = cur;
    }
  }
  ranges.push({ start, end: prev });

  // Delete from bottom to top so indices remain valid
  ranges.sort((a, b) => b.start - a.start);
  const requests = ranges.map(r => ({
    deleteDimension: {
      range: {
        sheetId: undefined, // using sheet by title via developerMetadata not set; rely on A1 notation via deleteRange fallback
        dimension: 'ROWS',
        startIndex: r.start,
        endIndex: r.end + 1
      }
    }
  }));

  // Fallback to deleteRange with a1Notation (more robust when sheetId unknown)
  const batch = {
    requests: ranges.map(r => ({
      deleteRange: {
        range: { sheetId: 0, startRowIndex: r.start, endRowIndex: r.end + 1 },
        shiftDimension: 'ROWS'
      }
    }))
  };

  try {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: batch });
  } catch (e) {
    // If the assumed sheetId (0) fails, ignore pruning (append still succeeded)
    console.warn('Prune failed:', e?.message || e);
  }
}

async function createLogSheet(title = 'Mail Merge Logs', tab = 'Logs', shareWithEmail) {
  const { sheets, drive } = await getSheetsClient();
  // Create spreadsheet with a Logs tab
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [{ properties: { title: tab } }]
    }
  });
  const spreadsheetId = createRes.data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  // Write header row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1:H1`,
    valueInputOption: 'RAW',
    requestBody: { values: [[
      'timestamp','userEmail','sentTo','type','status','message','retention_days','meta'
    ]]}
  });
  // Optionally share with a user
  if (shareWithEmail) {
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: shareWithEmail
        },
        sendNotificationEmail: false
      });
    } catch (e) {
      console.warn('Sharing failed:', e?.message || e);
    }
  }
  return { spreadsheetId, spreadsheetUrl };
}

async function sendEmails(recipients, subject, body, accessToken, userEmail) {
  console.log(`[sendEmails] Starting send for ${recipients.length} recipients`);
  const gmail = google.gmail({ version: 'v1', headers: { Authorization: `Bearer ${accessToken}` } });
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const recipientEmail = recipient.Email || recipient.email;
    console.log(`[sendEmails] Processing ${i + 1}/${recipients.length}: ${recipientEmail}`);

    try {
      // Replace placeholders in subject and body
      let personalizedSubject = subject;
      let personalizedBody = body;

      for (const [key, value] of Object.entries(recipient)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        personalizedSubject = personalizedSubject.replace(placeholder, value);
        personalizedBody = personalizedBody.replace(placeholder, value);
      }

      const email = [
        `To: ${recipientEmail}`,
        `Subject: ${personalizedSubject}`,
        '',
        personalizedBody
      ].join('\n');

      const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      console.log(`[sendEmails] Sending email via Gmail API to ${recipientEmail}`);
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });
      console.log(`[sendEmails] Email sent successfully to ${recipientEmail}`);

      // Log success
      try {
        await appendLogRow({
          timestamp: new Date().toISOString(),
          userEmail: userEmail,
          sentTo: recipientEmail,
          type: 'send',
          status: 'success',
          message: `Email sent to ${recipientEmail}`,
          retention_days: 30,
          meta: { subject: personalizedSubject }
        });
      } catch (logError) {
        console.error(`[sendEmails] Failed to log success for ${recipientEmail}:`, logError.message);
      }

      results.push({ email: recipientEmail, status: 'success' });
    } catch (error) {
      console.error(`[sendEmails] Failed to send to ${recipientEmail}:`, error.message);

      // Log failure
      try {
        await appendLogRow({
          timestamp: new Date().toISOString(),
          userEmail: userEmail,
          sentTo: recipientEmail,
          type: 'send',
          status: 'error',
          message: `Failed to send: ${error.message}`,
          retention_days: 30,
          meta: { error: error.message }
        });
      } catch (logError) {
        console.error(`[sendEmails] Failed to log error for ${recipientEmail}:`, logError.message);
      }

      results.push({ email: recipientEmail, status: 'error', error: error.message });
    }
  }

  console.log(`[sendEmails] Completed all sends`);
  return results;
}

async function previewEmails(recipients, subject, body) {
  const previews = recipients.slice(0, 3).map(recipient => {
    let personalizedSubject = subject;
    let personalizedBody = body;

    for (const [key, value] of Object.entries(recipient)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      personalizedSubject = personalizedSubject.replace(placeholder, value);
      personalizedBody = personalizedBody.replace(placeholder, value);
    }

    return {
      to: recipient.Email || recipient.email,
      subject: personalizedSubject,
      body: personalizedBody
    };
  });

  return previews;
}

async function getStats() {
  requireSheetConfig();
  const { sheets } = await getSheetsClient();

  const read = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A2:H`
  });

  const rows = read.data.values || [];
  const stats = {
    total: rows.length,
    sent: rows.filter(r => r[3] === 'send' && r[4] === 'success').length,
    failed: rows.filter(r => r[3] === 'send' && r[4] === 'error').length,
    recent: rows.slice(-5).reverse().map(r => ({
      timestamp: r[0],
      userEmail: r[1],
      sentTo: r[2],
      type: r[3],
      status: r[4],
      message: r[5]
    }))
  };

  return stats;
}

app.post('/', async (req, res) => {
  const { action, ...params } = req.body || {};
  const authHeader = req.headers.authorization;
  const accessToken = authHeader ? authHeader.replace('Bearer ', '') : null;

  try {
    if (action === 'send') {
      console.log(`[SEND] Starting email send for ${params?.recipients?.length || 0} recipients`);
      if (!accessToken) {
        console.error('[SEND] Missing access token');
        return res.status(401).json({ success: false, error: 'Missing access token' });
      }
      const { recipients, subject, body, userEmail } = params || {};
      if (!recipients || !subject || !body) {
        console.error('[SEND] Missing required parameters');
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
      }
      console.log(`[SEND] Sending to ${recipients.length} recipients as ${userEmail}`);
      const results = await sendEmails(recipients, subject, body, accessToken, userEmail);
      console.log(`[SEND] Completed with ${results.filter(r => r.status === 'success').length} successes`);
      return res.json({ success: true, data: results });
    }

    if (action === 'preview') {
      const { recipients, subject, body } = params || {};
      if (!recipients || !subject || !body) {
        return res.status(400).json({ success: false, error: 'Missing required parameters' });
      }
      const previews = await previewEmails(recipients, subject, body);
      return res.json({ success: true, data: previews });
    }

    if (action === 'stats') {
      const stats = await getStats();
      return res.json({ success: true, data: stats });
    }

    if (action === 'log_event') {
      const { event } = params || {};
      if (!event) return res.status(400).json({ success: false, error: 'Missing event' });
      await appendLogRow(event);
      const days = Number(event.retention_days ?? 30) || 30;
      // Best-effort prune (non-blocking)
      pruneOldRows(days).catch(() => {});
      return res.json({ success: true });
    }

    if (action === 'create_log_sheet') {
      const { title, shareWithEmail, tab } = params || {};
      const r = await createLogSheet(title || 'Mail Merge Logs', tab || 'Logs', shareWithEmail);
      return res.json({ success: true, data: r });
    }

    if (action === 'health') {
      return res.json({ success: true, status: 'ok' });
    }

    return res.status(501).json({ success: false, error: 'Not Implemented' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const stack = e instanceof Error ? e.stack : '';
    console.error(`[ERROR] Action: ${action}, Error: ${msg}`);
    console.error(stack);
    return res.status(500).json({ success: false, error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});


