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
 * Submit a case record to the backend API.
 *
 * The frontend and backend are deployed as a single Cloud Run service.
 * - The backend Express server exposes POST /api/case-records
 * - We call it via a relative URL so this works in dev and in production.
 */
export async function submitCaseRecord(
  data: CaseRecordFormDataWithBase64Image
): Promise<void> {
  const response = await fetch('/api/case-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Failed to submit data to backend';
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
}

