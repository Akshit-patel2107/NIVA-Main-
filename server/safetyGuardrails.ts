import { AIResponseMode } from '../src/types/ai';

export const NIVA_CORE_SYSTEM_PROMPT = `You are NIVA, an intelligent, compassionate, and certified clinical wellness AI companion specializing in women's menstrual health, hormonal rhythms, and cycle wellbeing.

Core Personality & Voice Guidelines:
1. Tone: Friendly, calm, deeply supportive, non-judgmental, and empowering.
2. Clarity: Speak in clear, modern, approachable language. Explain biological and hormonal mechanisms (estrogen, progesterone, prostaglandins, LH) without intimidating jargon.
3. Conciseness by Default: Respect the user's attention. Avoid conversational fluff or repetitive intros. Provide structured, actionable, and gentle advice.
4. Privacy First: Treat all health, mood, and cycle disclosures with utmost discretion.
5. Never Alarming: Always maintain a grounded, soothing tone. Never induce anxiety or panic.

Medical Safety Guardrails (Strict Requirement):
1. You are a menstrual wellness and education companion, NOT a medical doctor.
2. NEVER claim to diagnose, cure, or prescribe.
3. NEVER present speculative correlations as definitive medical diagnoses.
4. When serious symptoms arise (e.g. soaking through a pad/tampon every hour for 2+ consecutive hours, sudden unmanageable pain, severe fever with pelvic pain), guide the user with warm, non-alarmist urgency to seek clinical care.
5. Every response must conclude with:
"Reminder: NIVA AI provides general wellness information and does not replace professional medical advice."
`;

export interface SanitizedContextOptions {
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

/**
 * Builds a compressed, privacy-sanitized prompt for the LLM.
 */
export function buildSanitizedPrompt(opts: SanitizedContextOptions): {
  systemPrompt: string;
  userPrompt: string;
  contextSummary: string;
} {
  const { question, messages = [], cycleContext, responseMode = 'balanced' } = opts;

  let lengthGuide = 'Provide an answer around 120-200 words.';
  if (responseMode === 'quick') {
    lengthGuide = 'Provide a concise, direct answer around 60-100 words. Get straight to the key points.';
  } else if (responseMode === 'detailed') {
    lengthGuide = 'Provide a thorough, comprehensive breakdown (250-400 words) with detailed biological mechanisms and step-by-step lifestyle guidance.';
  }

  // Construct cycle background only if explicitly provided
  let cycleContextText = 'User has chosen not to share cycle tracking data for this question.';
  if (cycleContext) {
    const symptomsList =
      cycleContext.symptoms && cycleContext.symptoms.length > 0
        ? cycleContext.symptoms.join(', ')
        : 'None reported';
    cycleContextText = `Current User Cycle Context (Voluntarily Provided):
• Cycle Day: Day ${cycleContext.cycleDay ?? 14} of ${cycleContext.cycleLength ?? 28}-day cycle
• Menstrual Phase: ${cycleContext.phase ?? 'Unknown'}
• Flow Intensity: ${cycleContext.flow ?? 'None'}
• Cramp Severity (0-5 scale): ${cycleContext.crampsLevel ?? 0}/5
• Mood State: ${cycleContext.mood ?? 'Balanced'}
• Active Symptoms: ${symptomsList}
• Daily Wellness: Hydration: ${cycleContext.water ?? 6} glasses, Sleep: ${cycleContext.sleep ?? 7.5}h`;
  }

  // Smart context compaction: summarize earlier messages if history is long
  let historySection = '';
  if (messages.length > 0) {
    // Keep only the most recent 4 messages intact
    const recent = messages.slice(-4);
    historySection = `Recent Conversation Context:\n${recent
      .map((m) => `${m.role === 'user' ? 'User' : 'NIVA'}: ${m.content}`)
      .join('\n')}\n`;
  }

  const userPrompt = `
${cycleContextText}

${historySection}
User Query: "${question.trim()}"

Instructions for this response:
- ${lengthGuide}
- Be empathetic, practical, and grounded in women's biology.
- Include 2-3 comforting, actionable self-care or nutritional steps where applicable.
- Conclude with the required standard medical reminder.
`;

  return {
    systemPrompt: NIVA_CORE_SYSTEM_PROMPT,
    userPrompt: userPrompt.trim(),
    contextSummary: cycleContext ? `Day ${cycleContext.cycleDay} (${cycleContext.phase})` : 'General Context',
  };
}

/**
 * Validates and post-processes generated text to guarantee safety and privacy compliance.
 */
export function validateAndSanitizeResponse(rawText: string): {
  cleanText: string;
  hasRedFlags: boolean;
} {
  if (!rawText || typeof rawText !== 'string') {
    return {
      cleanText:
        'Thank you for checking in with NIVA. Please take gentle care of your body today, stay hydrated, and rest as needed.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.',
      hasRedFlags: false,
    };
  }

  let text = rawText.trim();

  // Strip accidental leaked system instructions or prompt tags
  text = text.replace(/\[System:.*?\]/gi, '');
  text = text.replace(/<\|.*?\|>/g, '');
  text = text.replace(/GEMINI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY/gi, '[REDACTED]');

  // Check for critical clinical red flags in query/response
  const lower = text.toLowerCase();
  const redFlags = [
    'soak through a pad',
    'soaking through',
    'unmanageable pain',
    'fever with pelvic',
    'fainting',
  ];
  const hasRedFlags = redFlags.some((rf) => lower.includes(rf));

  // Ensure standard medical reminder is present
  const standardDisclaimer =
    'Reminder: NIVA AI provides general wellness information and does not replace professional medical advice.';
  if (!text.includes('Reminder: NIVA AI provides general wellness information') && !text.includes('does not replace professional medical advice')) {
    text += `\n\n${standardDisclaimer}`;
  }

  return {
    cleanText: text,
    hasRedFlags,
  };
}
