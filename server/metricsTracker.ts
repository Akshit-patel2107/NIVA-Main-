import {
  AIProviderId,
  AIRequestCategory,
  AIMetricsSummary,
  ProviderMetricStats,
  AIResponseMode,
} from '../src/types/ai';

interface RecentRequestLog {
  id: string;
  timestamp: string;
  category: AIRequestCategory;
  provider: AIProviderId;
  model: string;
  latencyMs: number;
  mode: AIResponseMode;
  fallbackUsed: boolean;
  tokens: number;
  success: boolean;
}

class MetricsTracker {
  private totalRequests = 0;
  private totalFallbacks = 0;
  private recentLogs: RecentRequestLog[] = [];
  private readonly MAX_LOGS = 50;

  private providerData: Record<
    AIProviderId,
    {
      requests: number;
      successes: number;
      errors: number;
      fallbacks: number;
      totalLatencyMs: number;
      totalTokens: number;
      estimatedCostUSD: number;
      available: boolean;
      model: string;
      displayName: string;
    }
  > = {
    gemini: {
      requests: 0,
      successes: 0,
      errors: 0,
      fallbacks: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      available: true,
      model: 'gemini-3.8-flash',
      displayName: 'Google Gemini',
    },
    openai: {
      requests: 0,
      successes: 0,
      errors: 0,
      fallbacks: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      available: true,
      model: 'gpt-4o-mini',
      displayName: 'OpenAI (ChatGPT)',
    },
    claude: {
      requests: 0,
      successes: 0,
      errors: 0,
      fallbacks: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      available: true,
      model: 'claude-3-5-sonnet',
      displayName: 'Anthropic Claude',
    },
    kimi: {
      requests: 0,
      successes: 0,
      errors: 0,
      fallbacks: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      available: true,
      model: 'moonshot-v1-8k',
      displayName: 'Moonshot AI Kimi',
    },
    'clinical-matrix': {
      requests: 0,
      successes: 0,
      errors: 0,
      fallbacks: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      estimatedCostUSD: 0,
      available: true,
      model: 'clinical-matrix',
      displayName: 'Clinical Matrix (Offline)',
    },
  };

  private categoryCounts: Record<AIRequestCategory, number> = {
    simple_question: 0,
    wellness_question: 0,
    cycle_analysis: 0,
    personalized_insight: 0,
    long_conversation: 0,
    complex_reasoning: 0,
    educational_explanation: 0,
    safety_sensitive: 0,
  };

  public recordRequest(params: {
    category: AIRequestCategory;
    provider: AIProviderId;
    model: string;
    latencyMs: number;
    mode: AIResponseMode;
    fallbackUsed: boolean;
    tokens?: number;
    success: boolean;
  }): void {
    const { category, provider, model, latencyMs, mode, fallbackUsed, success } = params;

    const estimatedTokens = params.tokens || Math.max(120, Math.round(latencyMs * 0.4));
    this.totalRequests++;
    if (fallbackUsed) this.totalFallbacks++;

    if (category in this.categoryCounts) {
      this.categoryCounts[category]++;
    }

    const p = this.providerData[provider] || this.providerData['clinical-matrix'];
    p.requests++;
    p.totalLatencyMs += latencyMs;
    p.totalTokens += estimatedTokens;
    if (success) {
      p.successes++;
      p.available = true;
    } else {
      p.errors++;
    }
    if (fallbackUsed) {
      p.fallbacks++;
    }

    // Cost estimation calculation per 1,000 tokens
    let costPerK = 0.0001; // default ~0.0001
    if (provider === 'openai') {
      costPerK = model.includes('4o-mini') ? 0.00015 : 0.003;
    } else if (provider === 'claude') {
      costPerK = model.includes('haiku') ? 0.00025 : 0.003;
    } else if (provider === 'kimi') {
      costPerK = 0.0012;
    } else if (provider === 'gemini') {
      costPerK = model.includes('lite') ? 0.000075 : 0.00015;
    } else {
      costPerK = 0; // Clinical Matrix is free
    }
    p.estimatedCostUSD += (estimatedTokens / 1000) * costPerK;

    // Add to circular recent requests log
    const log: RecentRequestLog = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category,
      provider,
      model,
      latencyMs,
      mode,
      fallbackUsed,
      tokens: estimatedTokens,
      success,
    };

    this.recentLogs.unshift(log);
    if (this.recentLogs.length > this.MAX_LOGS) {
      this.recentLogs.pop();
    }
  }

  public setProviderAvailability(provider: AIProviderId, available: boolean): void {
    if (this.providerData[provider]) {
      this.providerData[provider].available = available;
    }
  }

  public getSummary(): AIMetricsSummary {
    const providerStats: Record<AIProviderId, ProviderMetricStats> = {} as any;

    const configuredMap: Record<AIProviderId, boolean> = {
      gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
      openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5),
      claude: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5),
      kimi: Boolean(
        (process.env.MOONSHOT_API_KEY && process.env.MOONSHOT_API_KEY.length > 5) ||
          (process.env.KIMI_API_KEY && process.env.KIMI_API_KEY.length > 5)
      ),
      'clinical-matrix': true,
    };

    for (const key of Object.keys(this.providerData) as AIProviderId[]) {
      const data = this.providerData[key];
      const avgLatencyMs = data.requests > 0 ? Math.round(data.totalLatencyMs / data.requests) : 0;
      providerStats[key] = {
        requests: data.requests,
        successes: data.successes,
        errors: data.errors,
        fallbacks: data.fallbacks,
        avgLatencyMs,
        totalTokens: data.totalTokens,
        estimatedCostUSD: Math.round(data.estimatedCostUSD * 10000) / 10000,
        available: data.available,
        configured: configuredMap[key] ?? false,
        model: data.model,
        displayName: data.displayName,
      };
    }

    const overallFallbackRate =
      this.totalRequests > 0 ? Math.round((this.totalFallbacks / this.totalRequests) * 100) : 0;

    let activeProvider = 'Google Gemini (Primary)';
    if (process.env.NIVA_AI_DEFAULT_PROVIDER && process.env.NIVA_AI_DEFAULT_PROVIDER !== 'auto') {
      activeProvider = `${process.env.NIVA_AI_DEFAULT_PROVIDER.toUpperCase()} (Configured)`;
    }

    return {
      totalRequests: this.totalRequests,
      overallFallbackRate,
      activeProvider,
      providerStats,
      categoryStats: { ...this.categoryCounts },
      recentRequests: [...this.recentLogs],
    };
  }

  public reset(): void {
    this.totalRequests = 0;
    this.totalFallbacks = 0;
    this.recentLogs = [];
    for (const key of Object.keys(this.providerData) as AIProviderId[]) {
      const p = this.providerData[key];
      p.requests = 0;
      p.successes = 0;
      p.errors = 0;
      p.fallbacks = 0;
      p.totalLatencyMs = 0;
      p.totalTokens = 0;
      p.estimatedCostUSD = 0;
      p.available = true;
    }
    for (const c of Object.keys(this.categoryCounts) as AIRequestCategory[]) {
      this.categoryCounts[c] = 0;
    }
  }
}

export const metricsTracker = new MetricsTracker();
