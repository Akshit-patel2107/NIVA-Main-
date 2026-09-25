import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-niva-ai',
        },
      },
    });
  }
  return aiClient;
}

export interface GeminiCallParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callGemini(
  params: GeminiCallParams
): Promise<{ text: string; model: string }> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured');
  }

  const candidateModels = [
    params.model || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: params.userPrompt,
        config: {
          systemInstruction: params.systemPrompt,
          maxOutputTokens: params.maxTokens || 800,
          temperature: params.temperature ?? 0.6,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return { text, model };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini (${model}) error:`, err?.message || err);
      // If error is temporary, try next candidate model
      continue;
    }
  }

  throw lastError || new Error('Gemini provider failed to generate content');
}

export async function* streamGemini(
  params: GeminiCallParams
): AsyncGenerator<string, { model: string }, unknown> {
  const client = getClient();
  if (!client) {
    throw new Error('Gemini API key is not configured');
  }

  const model = params.model || 'gemini-3.8-flash';

  try {
    const responseStream = await client.models.generateContentStream({
      model,
      contents: params.userPrompt,
      config: {
        systemInstruction: params.systemPrompt,
        maxOutputTokens: params.maxTokens || 800,
        temperature: params.temperature ?? 0.6,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }

    return { model };
  } catch (err: any) {
    // If streaming fails, fall back to non-streaming single chunk
    const single = await callGemini(params);
    yield single.text;
    return { model: single.model };
  }
}
