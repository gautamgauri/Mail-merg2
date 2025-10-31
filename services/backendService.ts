export interface BackendResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const callBackend = async (
  backendUrl: string,
  action: string,
  params: Record<string, any>,
  accessToken?: string
): Promise<BackendResponse> => {
  if (!backendUrl) {
    return { success: false, error: "Backend service URL is not configured." };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }


  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: JSON.stringify({ action, ...params }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Backend service execution error:', errorBody);
        throw new Error(`The backend service returned an error (status ${response.status}). Check console for details.`);
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error("Failed to call backend service:", error);
    let errorMessage = "An unknown error occurred while contacting the backend service.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "A network error occurred. Please check your internet connection and ensure the Backend URL is correct and accessible.";
    }
    return { success: false, error: errorMessage };
  }
};
