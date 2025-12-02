import { CaseRecordFormDataWithBase64Image } from '../types';

/**
 * Converts a File object to a Base64 encoded string.
 * @param file The File object to convert.
 * @returns A Promise that resolves with the Base64 string, or rejects if an error occurs.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Real API call to submit case record data to a Google Sheets "backend"
 * implemented as a Google Apps Script Web App.
 *
 * SECURITY NOTE:
 * - Do NOT call the Google Sheets API directly from the browser with secrets.
 * - Instead, create a Google Apps Script Web App that:
 *   - Has access to your Google Sheet.
 *   - Is deployed as a Web App (execute as: you; accessible by: Anyone with the link or your org).
 *   - Accepts POST requests with JSON and appends a row to the sheet.
 *
 * FRONTEND SETUP (this app):
 * - Create a `.env` file in the project root with:
 *     VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/XXXXX/exec"
 * - Restart `npm run dev` after changing env variables.
 *
 * BACKEND SETUP (Google Apps Script):
 * - Example `Code.gs` for your Web App is included at the bottom of this file.
 *
 * @param data The case record data, with photo evidence as a Base64 string.
 * @returns A Promise that resolves on successful submission or rejects on error.
 */
export async function submitCaseRecord(
  data: CaseRecordFormDataWithBase64Image
): Promise<void> {
  const endpoint =
    // Prefer env var, fall back to a visible placeholder you can replace.
    import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/YOUR_DEPLOYED_WEB_APP_ID/exec';

  const payload = {
    ...data,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Failed to submit data to Google Sheets backend';
    try {
      const errorData = await response.json();
      if (errorData && (errorData as any).error) {
        message = (errorData as any).error;
      }
    } catch {
      // ignore JSON parse errors, fall back to default message
    }
    throw new Error(message);
  }

  // If Apps Script returns JSON, you can inspect it here:
  // const result = await response.json();
  // console.log('Google Sheets backend result:', result);
}

/**
 * BACKEND EXAMPLE – Google Apps Script Web App
 *
 * 1. In Google Drive, create a new Google Sheet and note its ID from the URL.
 * 2. Name a sheet/tab, e.g. "FormResponses".
 * 3. Open Extensions → Apps Script and paste this into `Code.gs`:
 *
 * function doPost(e) {
 *   try {
 *     var body = JSON.parse(e.postData.contents);
 *
 *     var ss = SpreadsheetApp.openById('YOUR_SHEET_ID_HERE');
 *     var sheet = ss.getSheetByName('FormResponses'); // or your sheet name
 *
 *     sheet.appendRow([
 *       new Date(),                              // Timestamp
 *       body.facilitatorName,
 *       body.dateOfInterview,
 *       body.locationCenter,
 *       body.beneficiaryName,
 *       body.age,
 *       body.occupation,
 *       body.contactNumber,
 *       body.sochLowHighRelevance,
 *       body.sochQuote,
 *       (body.samajhSpecificRights || []).join(', '),
 *       body.samajhExplanation,
 *       body.samajhFacilitatorRating,
 *       (body.samvaadActions || []).join(', '),
 *       body.samvaadStory,
 *       body.facilitatorNote,
 *       body.confidenceLevel,
 *       body.photoEvidence // Base64 image string (or handle upload to Drive here)
 *     ]);
 *
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ success: true }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (err) {
 *     return ContentService
 *       .createTextOutput(JSON.stringify({ error: err.message }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 *
 * 4. Deploy → New deployment → Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone with the link (or your org)
 * 5. Copy the Web App URL and set it as `VITE_GOOGLE_APPS_SCRIPT_URL` in `.env`.
 */


