export interface ClaudeCallParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callClaude(
  params: ClaudeCallParams
): Promise<{ text: string; model: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const model = params.model || 'claude-3-5-sonnet-20241022';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userPrompt }],
      max_tokens: params.maxTokens || 800,
      temperature: params.temperature ?? 0.6,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Claude HTTP ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text?.trim();

  if (!text) {
    throw new Error('Claude returned an empty response');
  }

  return { text, model };
}

export async function* streamClaude(
  params: ClaudeCallParams
): AsyncGenerator<string, { model: string }, unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const model = params.model || 'claude-3-5-sonnet-20241022';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userPrompt }],
      max_tokens: params.maxTokens || 800,
      temperature: params.temperature ?? 0.6,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const errorBody = await res.text();
    throw new Error(`Claude Stream HTTP ${res.status}: ${errorBody}`);
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

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.type === 'content_block_delta') {
          const textChunk = parsed.delta?.text;
          if (textChunk) {
            yield textChunk;
          }
        }
      } catch {
        // partial chunk
      }
    }
  }

  return { model };
}
