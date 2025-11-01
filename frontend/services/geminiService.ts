
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";

export const enhanceEmailTemplate = async (
  originalBody: string,
  prompt: string
): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'PLACEHOLDER_API_KEY' || process.env.API_KEY === 'your_gemini_api_key_here') {
    return `Error: Gemini API key not configured. Please:\n1. Copy .env.example to .env.local\n2. Add your API key from https://aistudio.google.com/app/apikey\n3. Restart the development server`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const fullPrompt = `You are an expert marketing copywriter. Rewrite the following email body to be ${prompt}.
    It is crucial that you keep all placeholders (e.g., {{Name}}, {{Company}}) exactly as they are. Do not add any new placeholders.

    Original email body:
    ---
    ${originalBody}
    ---

    Rewritten email body:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt
    });

    return response.text;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);

    // Provide more specific error messages
    if (error?.message?.includes('API key')) {
      return `Error: Invalid API key. Please check your GEMINI_API_KEY in .env.local`;
    }
    if (error?.message?.includes('quota')) {
      return `Error: API quota exceeded. Please check your Gemini API usage limits.`;
    }
    if (error?.message?.includes('network')) {
      return `Error: Network error. Please check your internet connection.`;
    }

    return `Error enhancing template: ${error?.message || 'Unknown error'}. Check console for details.`;
  }
};

const tools: FunctionDeclaration[] = [
  {
    name: 'get_stats',
    description: 'Get statistics about the mail merge, like how many emails have been sent and how many are pending.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    }
  },
  {
    name: 'preview_emails',
    description: 'Preview the first few emails. Can be filtered by a specific criteria.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter: {
          type: Type.STRING,
          description: 'A criteria to filter recipients by, e.g., "unsent rows" or "field staff in Bihta".'
        },
        count: {
            type: Type.INTEGER,
            description: 'The number of emails to preview. Defaults to 3.'
        }
      },
      required: [],
    },
  },
  {
    name: 'send_emails',
    description: 'Send all unsent emails. Can be filtered by a specific criteria.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter: {
          type: Type.STRING,
          description: 'A criteria to filter which recipients to send emails to, e.g., "all unsent" or "to the marketing team".'
        }
      },
      required: [],
    }
  },
  {
    name: 'draft_email',
    description: 'Drafts or rewrites an email body based on a prompt. This is for generating content, not sending.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt: {
                type: Type.STRING,
                description: 'The instructions for how to draft the email, e.g., "draft a follow-up to our first message" or "rewrite this to be more formal".'
            },
            current_body: {
                type: Type.STRING,
                description: 'The current email body, if any, that needs to be rewritten.'
            }
        },
        required: ['prompt']
    }
  }
];

export const parseCommand = async (command: string, currentBody: string): Promise<GenerateContentResponse> => {
    if (!process.env.API_KEY || process.env.API_KEY === 'PLACEHOLDER_API_KEY' || process.env.API_KEY === 'your_gemini_api_key_here') {
        throw new Error("Gemini API key not configured. Please check your .env.local file.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Given the user's command, call the appropriate function. Command: "${command}". For context, the current email body is: "${currentBody}"`,
          config: {
            tools: [{ functionDeclarations: tools }],
          },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            return response;
        }

        // If no function call, treat it as a general text generation prompt
        const textResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `The user said: "${command}". Provide a helpful response as a mail merge assistant. If they are asking to draft an email, provide just the email text.`
        });
        return textResponse;

    } catch (error: any) {
        console.error("Gemini command parsing failed:", error);

        // Provide specific error messages
        if (error?.message?.includes('API key')) {
            throw new Error("Invalid API key. Please check your GEMINI_API_KEY in .env.local");
        }
        if (error?.message?.includes('quota')) {
            throw new Error("API quota exceeded. Please check your Gemini API usage limits.");
        }
        if (error?.message?.includes('network')) {
            throw new Error("Network error. Please check your internet connection.");
        }

        throw new Error(`Failed to process command: ${error?.message || 'Unknown error'}`);
    }
};
