/**
 * Helper script to set up the header row in your Google Sheet.
 * 
 * Usage:
 * 1. Create a Google Sheet and get its ID from the URL
 * 2. Share the sheet with your service account email
 * 3. Set SHEET_ID and SHEET_NAME environment variables
 * 4. Run: npx tsx scripts/setup-sheet-headers.ts
 */

import { google } from 'googleapis';

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME || 'FormResponses';

if (!SHEET_ID) {
  console.error('Error: SHEET_ID environment variable is not set');
  console.error('Usage: SHEET_ID=your_sheet_id SHEET_NAME=FormResponses npx tsx scripts/setup-sheet-headers.ts');
  process.exit(1);
}

const headers = [
  'Timestamp',
  'Facilitator Name',
  'Date of Interview',
  'Location Center',
  'Beneficiary Name',
  'Age',
  'Occupation',
  'Contact Number',
  'SOCH: Low/High Relevance',
  'SOCH: Quote',
  'SAMAJH: Specific Rights',
  'SAMAJH: Explanation',
  'SAMAJH: Facilitator Rating',
  'SAMVAAD: Actions',
  'SAMVAAD: Story',
  'Facilitator Note',
  'Confidence Level',
  'Photo Evidence (Base64)'
];

async function setupHeaders() {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Check if sheet exists, create if not
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === SHEET_NAME
    );

    if (!sheetExists) {
      console.log(`Creating sheet "${SHEET_NAME}"...`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEET_NAME
              }
            }
          }]
        }
      });
    }

    // Set headers in row 1
    console.log(`Setting up headers in sheet "${SHEET_NAME}"...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    // Format header row (bold, freeze)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId: spreadsheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              fields: 'userEnteredFormat.textFormat.bold,userEnteredFormat.backgroundColor',
              rows: [{
                values: headers.map(() => ({
                  userEnteredFormat: {
                    textFormat: { bold: true },
                    backgroundColor: { red: 0.9, green: 0.9, blue: 1.0 }
                  }
                }))
              }]
            }
          },
          {
            updateSheetProperties: {
              properties: {
                sheetId: spreadsheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME)?.properties?.sheetId,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          }
        ]
      }
    });

    console.log('✅ Headers set up successfully!');
    console.log(`\nSheet URL: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
    console.log(`\nNext steps:`);
    console.log(`1. Share this sheet with your Cloud Run service account`);
    console.log(`2. Set SHEET_ID=${SHEET_ID} in Cloud Run environment variables`);
    console.log(`3. Set SHEET_NAME=${SHEET_NAME} in Cloud Run environment variables (optional, defaults to FormResponses)`);
  } catch (err: any) {
    console.error('Error setting up headers:', err.message);
    if (err.message.includes('PERMISSION_DENIED')) {
      console.error('\n⚠️  Make sure you have shared the sheet with your service account email!');
    }
    process.exit(1);
  }
}

setupHeaders();

