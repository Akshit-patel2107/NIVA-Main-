import {
  AIProviderId,
  AIRouteDecision,
  AIResponseMode,
  AIChatStreamChunk,
} from '../src/types/ai';
import { classifyRequest } from './classifier';
import {
  buildSanitizedPrompt,
  validateAndSanitizeResponse,
} from './safetyGuardrails';
import { getCachedAnswer, setCachedAnswer } from './cache';
import { metricsTracker } from './metricsTracker';

// Providers
import { callGemini, streamGemini } from './providers/geminiProvider';
import { callOpenAI, streamOpenAI } from './providers/openaiProvider';
import { callClaude, streamClaude } from './providers/claudeProvider';
import { callKimi, streamKimi } from './providers/kimiProvider';
import { generateClinicalMatrixResponse } from './providers/clinicalMatrixProvider';

export interface OrchestratorInput {
  question: string;
  messages?: Array<{ role: string; content: string }>;
  cycleContext?: {
    cycleDay?: number;
    cycleLength?: number;
    phase?: string;
    flow?: string;
    crampsLevel?: number;
    mood?: string;
    symptoms?: string[];
    water?: number;
    sleep?: number;
  };
  responseMode?: AIResponseMode;
}

export interface OrchestratorResult {
  answer: string;
  provider: AIProviderId;
  model: string;
  category: string;
  fallbackUsed: boolean;
  cached: boolean;
  latencyMs: number;
}

const PROVIDER_TIMEOUT_MS = 14000; // 14s timeout per provider

async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Executes a single provider call with sanitized inputs and timeout.
 */
async function callProvider(
  provider: AIProviderId,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number,
  input: OrchestratorInput
): Promise<{ text: string; model: string }> {
  switch (provider) {
    case 'gemini':
      return executeWithTimeout(
        callGemini({ systemPrompt, userPrompt, model, maxTokens, temperature }),
        PROVIDER_TIMEOUT_MS
      );
    case 'openai':
      return executeWithTimeout(
        callOpenAI({ systemPrompt, userPrompt, model, maxTokens, temperature }),
        PROVIDER_TIMEOUT_MS
      );
    case 'claude':
      return executeWithTimeout(
        callClaude({ systemPrompt, userPrompt, model, maxTokens, temperature }),
        PROVIDER_TIMEOUT_MS
      );
    case 'kimi':
      return executeWithTimeout(
        callKimi({ systemPrompt, userPrompt, model, maxTokens, temperature }),
        PROVIDER_TIMEOUT_MS
      );
    case 'clinical-matrix':
    default: {
      const text = generateClinicalMatrixResponse({
        question: input.question,
        cycleContext: input.cycleContext,
        responseMode: input.responseMode,
      });
      return { text, model: 'clinical-evidence-matrix' };
    }
  }
}

/**
 * Standard Non-Streaming NIVA AI Orchestration.
 */
export async function generateResponse(input: OrchestratorInput): Promise<OrchestratorResult> {
  const startTime = Date.now();
  const hasPersonalContext = Boolean(input.cycleContext);

  // 1. Fast Cache Check
  const cached = getCachedAnswer(input.question, hasPersonalContext);
  if (cached) {
    const latency = Date.now() - startTime;
    metricsTracker.recordRequest({
      category: cached.category as any,
      provider: 'clinical-matrix',
      model: `${cached.source} (cached)`,
      latencyMs: latency,
      mode: input.responseMode || 'balanced',
      fallbackUsed: false,
      tokens: Math.round(cached.answer.length / 4),
      success: true,
    });
    return {
      answer: cached.answer,
      provider: 'clinical-matrix',
      model: cached.source,
      category: cached.category,
      fallbackUsed: false,
      cached: true,
      latencyMs: latency,
    };
  }

  // 2. Intelligent Model Routing
  const decision: AIRouteDecision = classifyRequest({
    question: input.question,
    messages: input.messages,
    cycleContext: input.cycleContext,
    responseMode: input.responseMode,
  });

  // 3. Smart Sanitized Prompt Assembly
  const { systemPrompt, userPrompt } = buildSanitizedPrompt({
    question: input.question,
    messages: input.messages,
    cycleContext: input.cycleContext,
    responseMode: input.responseMode,
  });

  // 4. Cascade execution with automatic failover
  const attemptChain: Array<{ provider: AIProviderId; model: string }> = [
    { provider: decision.primaryProvider, model: decision.primaryModel },
    ...decision.fallbackProviders.map((p) => ({
      provider: p,
      model: p === 'clinical-matrix' ? 'clinical-evidence-matrix' : 'default',
    })),
  ];

  let rawAnswer = '';
  let finalProvider: AIProviderId = decision.primaryProvider;
  let finalModel = decision.primaryModel;
  let fallbackUsed = false;
  let success = false;

  for (let i = 0; i < attemptChain.length; i++) {
    const { provider, model } = attemptChain[i];
    try {
      const res = await callProvider(
        provider,
        model,
        systemPrompt,
        userPrompt,
        decision.maxTokens,
        decision.temperature,
        input
      );
      if (res.text && res.text.trim().length > 10) {
        rawAnswer = res.text;
        finalProvider = provider;
        finalModel = res.model;
        fallbackUsed = i > 0;
        success = true;
        break;
      }
    } catch (err: any) {
      console.warn(`[NIVA Router] Provider ${provider} failed on attempt ${i + 1}:`, err?.message || err);
      metricsTracker.setProviderAvailability(provider, false);
      metricsTracker.recordRequest({
        category: decision.category,
        provider,
        model,
        latencyMs: Date.now() - startTime,
        mode: input.responseMode || 'balanced',
        fallbackUsed: i > 0,
        success: false,
      });
    }
  }

  // If even cascade exhausted (virtually impossible because clinical-matrix is infallible)
  if (!rawAnswer) {
    rawAnswer = generateClinicalMatrixResponse({
      question: input.question,
      cycleContext: input.cycleContext,
      responseMode: input.responseMode,
    });
    finalProvider = 'clinical-matrix';
    finalModel = 'clinical-evidence-matrix';
    fallbackUsed = true;
    success = true;
  }

  // 5. Response Quality Control & Medical Safety Enforcement
  const { cleanText } = validateAndSanitizeResponse(rawAnswer);
  const latency = Date.now() - startTime;

  // 6. Cache safe educational responses
  if (!hasPersonalContext && decision.category === 'simple_question') {
    setCachedAnswer(input.question, cleanText, finalModel, decision.category, hasPersonalContext);
  }

  // 7. Record Metrics
  metricsTracker.recordRequest({
    category: decision.category,
    provider: finalProvider,
    model: finalModel,
    latencyMs: latency,
    mode: input.responseMode || 'balanced',
    fallbackUsed,
    tokens: Math.round(cleanText.length / 3.8),
    success,
  });

  return {
    answer: cleanText,
    provider: finalProvider,
    model: finalModel,
    category: decision.category,
    fallbackUsed,
    cached: false,
    latencyMs: latency,
  };
}

/**
 * Real-time Streaming Generator (Server-Sent Events).
 */
export async function* generateStreamingResponse(
  input: OrchestratorInput
): AsyncGenerator<AIChatStreamChunk, void, unknown> {
  const startTime = Date.now();
  const hasPersonalContext = Boolean(input.cycleContext);

  // Cache check for instant stream simulation
  const cached = getCachedAnswer(input.question, hasPersonalContext);
  if (cached) {
    yield {
      chunk: cached.answer,
      status: 'complete',
      provider: 'clinical-matrix',
      model: cached.source,
      category: cached.category as any,
      fallbackUsed: false,
    };
    return;
  }

  // Routing
  const decision: AIRouteDecision = classifyRequest({
    question: input.question,
    messages: input.messages,
    cycleContext: input.cycleContext,
    responseMode: input.responseMode,
  });

  const { systemPrompt, userPrompt } = buildSanitizedPrompt({
    question: input.question,
    messages: input.messages,
    cycleContext: input.cycleContext,
    responseMode: input.responseMode,
  });

  const attemptChain: Array<{ provider: AIProviderId; model: string }> = [
    { provider: decision.primaryProvider, model: decision.primaryModel },
    ...decision.fallbackProviders.map((p) => ({
      provider: p,
      model: p === 'clinical-matrix' ? 'clinical-evidence-matrix' : 'default',
    })),
  ];

  let accumulated = '';
  let successfulProvider: AIProviderId = decision.primaryProvider;
  let successfulModel = decision.primaryModel;
  let fallbackUsed = false;
  let streamWorked = false;

  for (let i = 0; i < attemptChain.length; i++) {
    const { provider, model } = attemptChain[i];
    accumulated = '';
    try {
      if (provider === 'gemini') {
        const stream = streamGemini({
          systemPrompt,
          userPrompt,
          model,
          maxTokens: decision.maxTokens,
          temperature: decision.temperature,
        });
        for await (const chunk of stream) {
          accumulated += chunk;
          yield {
            chunk,
            status: 'streaming',
            provider: 'gemini',
            model,
            category: decision.category,
            fallbackUsed: i > 0,
          };
        }
      } else if (provider === 'openai') {
        const stream = streamOpenAI({
          systemPrompt,
          userPrompt,
          model,
          maxTokens: decision.maxTokens,
          temperature: decision.temperature,
        });
        for await (const chunk of stream) {
          accumulated += chunk;
          yield {
            chunk,
            status: 'streaming',
            provider: 'openai',
            model,
            category: decision.category,
            fallbackUsed: i > 0,
          };
        }
      } else if (provider === 'claude') {
        const stream = streamClaude({
          systemPrompt,
          userPrompt,
          model,
          maxTokens: decision.maxTokens,
          temperature: decision.temperature,
        });
        for await (const chunk of stream) {
          accumulated += chunk;
          yield {
            chunk,
            status: 'streaming',
            provider: 'claude',
            model,
            category: decision.category,
            fallbackUsed: i > 0,
          };
        }
      } else if (provider === 'kimi') {
        const stream = streamKimi({
          systemPrompt,
          userPrompt,
          model,
          maxTokens: decision.maxTokens,
          temperature: decision.temperature,
        });
        for await (const chunk of stream) {
          accumulated += chunk;
          yield {
            chunk,
            status: 'streaming',
            provider: 'kimi',
            model,
            category: decision.category,
            fallbackUsed: i > 0,
          };
        }
      } else {
        // Clinical Matrix fallback streaming simulation
        const full = generateClinicalMatrixResponse({
          question: input.question,
          cycleContext: input.cycleContext,
          responseMode: input.responseMode,
        });
        // Stream in natural word chunks
        const words = full.split(' ');
        for (let w = 0; w < words.length; w += 3) {
          const chunk = words.slice(w, w + 3).join(' ') + ' ';
          accumulated += chunk;
          yield {
            chunk,
            status: 'streaming',
            provider: 'clinical-matrix',
            model: 'clinical-evidence-matrix',
            category: decision.category,
            fallbackUsed: i > 0,
          };
        }
      }

      if (accumulated.trim().length > 10) {
        successfulProvider = provider;
        successfulModel = model;
        fallbackUsed = i > 0;
        streamWorked = true;
        break;
      }
    } catch (err: any) {
      console.warn(`[NIVA Stream Router] Provider ${provider} stream failed:`, err?.message || err);
      metricsTracker.setProviderAvailability(provider, false);
      metricsTracker.recordRequest({
        category: decision.category,
        provider,
        model,
        latencyMs: Date.now() - startTime,
        mode: input.responseMode || 'balanced',
        fallbackUsed: i > 0,
        success: false,
      });
    }
  }

  // Final validation and safety check
  const { cleanText } = validateAndSanitizeResponse(accumulated);

  // If the clean text contains the disclaimer appended, yield any missing disclaimer chunk
  if (cleanText.length > accumulated.length) {
    const extra = cleanText.slice(accumulated.length);
    yield {
      chunk: extra,
      status: 'streaming',
      provider: successfulProvider,
      model: successfulModel,
      category: decision.category,
      fallbackUsed,
    };
  }

  const latency = Date.now() - startTime;
  metricsTracker.recordRequest({
    category: decision.category,
    provider: successfulProvider,
    model: successfulModel,
    latencyMs: latency,
    mode: input.responseMode || 'balanced',
    fallbackUsed,
    tokens: Math.round(cleanText.length / 3.8),
    success: streamWorked,
  });

  yield {
    status: 'complete',
    provider: successfulProvider,
    model: successfulModel,
    category: decision.category,
    fallbackUsed,
  };
}
