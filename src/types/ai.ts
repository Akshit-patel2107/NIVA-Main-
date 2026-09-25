export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'kimi' | 'clinical-matrix';

export type AIRequestCategory =
  | 'simple_question'
  | 'wellness_question'
  | 'cycle_analysis'
  | 'personalized_insight'
  | 'long_conversation'
  | 'complex_reasoning'
  | 'educational_explanation'
  | 'safety_sensitive';

export type AIResponseMode = 'quick' | 'balanced' | 'detailed';

export interface AIRouteDecision {
  category: AIRequestCategory;
  primaryProvider: AIProviderId;
  primaryModel: string;
  fallbackProviders: AIProviderId[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  reasoning: string;
  maxTokens: number;
  temperature: number;
}

export interface ProviderMetricStats {
  requests: number;
  successes: number;
  errors: number;
  fallbacks: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCostUSD: number;
  available: boolean;
  configured: boolean;
  model: string;
  displayName: string;
}

export interface AIMetricsSummary {
  totalRequests: number;
  overallFallbackRate: number;
  activeProvider: string;
  providerStats: Record<AIProviderId, ProviderMetricStats>;
  categoryStats: Record<AIRequestCategory, number>;
  recentRequests: Array<{
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
  }>;
}

export interface AIChatStreamChunk {
  chunk?: string;
  status: 'streaming' | 'complete' | 'error';
  provider?: AIProviderId;
  model?: string;
  category?: AIRequestCategory;
  fallbackUsed?: boolean;
  error?: string;
}
