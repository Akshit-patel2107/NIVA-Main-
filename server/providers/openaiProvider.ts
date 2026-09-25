export interface OpenAICallParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callOpenAI(
  params: OpenAICallParams
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = params.model || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      max_tokens: params.maxTokens || 800,
      temperature: params.temperature ?? 0.6,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('OpenAI returned an empty response');
  }

  return { text, model };
}

export async function* streamOpenAI(
  params: OpenAICallParams
): AsyncGenerator<string, { model: string }, unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = params.model || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      max_tokens: params.maxTokens || 800,
      temperature: params.temperature ?? 0.6,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const errorBody = await res.text();
    throw new Error(`OpenAI Stream HTTP ${res.status}: ${errorBody}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') return { model };

      try {
        const parsed = JSON.parse(dataStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          yield delta;
        }
      } catch {
        // partial line
      }
    }
  }

  return { model };
}
