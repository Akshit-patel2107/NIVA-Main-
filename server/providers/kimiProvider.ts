export interface KimiCallParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callKimi(
  params: KimiCallParams
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new Error('MOONSHOT_API_KEY / KIMI_API_KEY is not configured');
  }

  const model = params.model || 'moonshot-v1-8k';

  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
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
    throw new Error(`Kimi HTTP ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('Kimi returned an empty response');
  }

  return { text, model };
}

export async function* streamKimi(
  params: KimiCallParams
): AsyncGenerator<string, { model: string }, unknown> {
  const apiKey = process.env.MOONSHOT_API_KEY || process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new Error('MOONSHOT_API_KEY / KIMI_API_KEY is not configured');
  }

  const model = params.model || 'moonshot-v1-8k';

  const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
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
    throw new Error(`Kimi Stream HTTP ${res.status}: ${errorBody}`);
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
        // partial chunk
      }
    }
  }

  return { model };
}
