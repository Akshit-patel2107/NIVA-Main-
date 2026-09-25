import { AIProviderId, AIRequestCategory, AIRouteDecision, AIResponseMode } from '../src/types/ai';

export interface ClassifyInput {
  question: string;
  messages?: Array<{ role: string; content: string }>;
  cycleContext?: any;
  responseMode?: AIResponseMode;
}

/**
 * Checks which providers are configured via environment variables.
 */
export function getConfiguredProviders(): Record<AIProviderId, boolean> {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    openai: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5),
    claude: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 5),
    kimi: Boolean(
      (process.env.MOONSHOT_API_KEY && process.env.MOONSHOT_API_KEY.length > 5) ||
        (process.env.KIMI_API_KEY && process.env.KIMI_API_KEY.length > 5)
    ),
    'clinical-matrix': true, // Always available
  };
}

/**
 * Classifies user intent and determines the optimal model route and token budget.
 */
export function classifyRequest(input: ClassifyInput): AIRouteDecision {
  const { question, messages = [], cycleContext, responseMode = 'balanced' } = input;
  const lowerQ = question.toLowerCase();
  const configured = getConfiguredProviders();

  // 1. Safety sensitive check
  const safetyKeywords = [
    'soaking through',
    'soaking a pad every hour',
    'bleed heavily',
    'hemorrhage',
    'extreme pain',
    'debilitating pain',
    'fainted',
    'passed out',
    'fever and pelvic',
    'emergency',
    'suicidal',
    'hurt myself',
    'chest pain',
  ];
  const isSafety = safetyKeywords.some((k) => lowerQ.includes(k));

  let category: AIRequestCategory = 'wellness_question';
  let estimatedComplexity: 'low' | 'medium' | 'high' = 'medium';
  let reasoning = 'General menstrual cycle wellness query';

  if (isSafety) {
    category = 'safety_sensitive';
    estimatedComplexity = 'high';
    reasoning = 'Safety-critical health query requiring clinical guardrails';
  } else if (
    lowerQ.includes('analyze') ||
    lowerQ.includes('pattern') ||
    lowerQ.includes('last six cycles') ||
    lowerQ.includes('correlat') ||
    lowerQ.includes('variability')
  ) {
    category = 'cycle_analysis';
    estimatedComplexity = 'high';
    reasoning = 'Multi-cycle analytics and symptom correlation requested';
  } else if (
    lowerQ.includes('explain the biology') ||
    lowerQ.includes('how does estrogen') ||
    lowerQ.includes('endocrin') ||
    lowerQ.includes('luteinizing hormone') ||
    lowerQ.includes('compare luteal')
  ) {
    category = 'complex_reasoning';
    estimatedComplexity = 'high';
    reasoning = 'Detailed physiological reasoning requested';
  } else if (messages.length >= 6) {
    category = 'long_conversation';
    estimatedComplexity = 'medium';
    reasoning = 'Extended conversation requiring context preservation';
  } else if (
    Boolean(cycleContext) &&
    (lowerQ.includes('my cycle') || lowerQ.includes('my phase') || lowerQ.includes('today'))
  ) {
    category = 'personalized_insight';
    estimatedComplexity = 'medium';
    reasoning = 'Personalized query referencing user active cycle context';
  } else if (
    lowerQ.startsWith('what is') ||
    lowerQ.startsWith('define') ||
    lowerQ.startsWith('what are') ||
    lowerQ === 'hello' ||
    lowerQ === 'hi' ||
    lowerQ.length < 25
  ) {
    category = 'simple_question';
    estimatedComplexity = 'low';
    reasoning = 'Short, lightweight definition or greeting';
  } else if (
    lowerQ.includes('education') ||
    lowerQ.includes('explain') ||
    lowerQ.includes('guide')
  ) {
    category = 'educational_explanation';
    estimatedComplexity = 'medium';
    reasoning = 'Educational overview and general health concept';
  }

  // Determine token limits based on response mode
  let maxTokens = 600;
  if (responseMode === 'quick') {
    maxTokens = 300;
  } else if (responseMode === 'detailed') {
    maxTokens = 1100;
  } else if (estimatedComplexity === 'high') {
    maxTokens = 900;
  }

  // Model selection priority:
  // Default preferred order from environment variable or intelligent auto
  const defaultPref = process.env.NIVA_AI_DEFAULT_PROVIDER?.toLowerCase() || 'auto';

  // Available candidate chain
  let primaryProvider: AIProviderId = 'gemini';
  let primaryModel = 'gemini-3.8-flash';
  const fallbackProviders: AIProviderId[] = [];

  // Determine primary provider based on category & availability
  if (defaultPref === 'openai' && configured.openai) {
    primaryProvider = 'openai';
    primaryModel = estimatedComplexity === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
  } else if (defaultPref === 'claude' && configured.claude) {
    primaryProvider = 'claude';
    primaryModel = estimatedComplexity === 'high' ? 'claude-3-5-sonnet-20241022' : 'claude-3-haiku-20240307';
  } else if (defaultPref === 'kimi' && configured.kimi) {
    primaryProvider = 'kimi';
    primaryModel = 'moonshot-v1-8k';
  } else if (configured.gemini) {
    primaryProvider = 'gemini';
    primaryModel =
      responseMode === 'quick' || estimatedComplexity === 'low'
        ? 'gemini-3.1-flash-lite'
        : 'gemini-3.8-flash';
  } else if (configured.openai) {
    primaryProvider = 'openai';
    primaryModel = estimatedComplexity === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
  } else if (configured.claude) {
    primaryProvider = 'claude';
    primaryModel = 'claude-3-5-sonnet-20241022';
  } else if (configured.kimi) {
    primaryProvider = 'kimi';
    primaryModel = 'moonshot-v1-8k';
  } else {
    primaryProvider = 'clinical-matrix';
    primaryModel = 'clinical-evidence-matrix';
  }

  // Build fallback cascade (excluding the primary)
  const candidatePool: AIProviderId[] = ['gemini', 'openai', 'claude', 'kimi'];
  for (const prov of candidatePool) {
    if (prov !== primaryProvider && configured[prov]) {
      fallbackProviders.push(prov);
    }
  }
  // Clinical Matrix is the universal safety net
  fallbackProviders.push('clinical-matrix');

  return {
    category,
    primaryProvider,
    primaryModel,
    fallbackProviders,
    estimatedComplexity,
    reasoning,
    maxTokens,
    temperature: category === 'safety_sensitive' || category === 'cycle_analysis' ? 0.3 : 0.6,
  };
}
