import OpenAI from 'openai';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!DEEPSEEK_API_KEY) {
    return null;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: DEEPSEEK_API_KEY,
      baseURL: DEEPSEEK_BASE_URL,
    });
  }
  return client;
}

/**
 * Generate a concise, formal Project Manager commentary for senior management.
 * Returns an empty string if Deepseek is not configured or errors occur.
 */
export async function generateProjectManagerCommentary(
  prompt: string
): Promise<string> {
  try {
    const c = getClient();
    if (!c) {
      return '';
    }

    const completion = await c.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a Project Manager for the Pehal Project of the Yeh Ek Soch Foundation, Uttar Pradesh. Use the provided data to write concise, formal insights for senior management. Focus on impact, risks, and recommended follow-up actions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return '';
    }
    return typeof content === 'string' ? content.trim() : '';
  } catch (err) {
    console.error('Deepseek commentary error:', err);
    return '';
  }
}



