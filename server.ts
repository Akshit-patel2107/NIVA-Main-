import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust Gemini generation with automatic retry and model failover
async function generateWithRetryAndFallback(
  prompt: string,
  config?: any
): Promise<{ text: string; model: string } | null> {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  // Model fallback cascade: start with gemini-3.8-flash, failover to gemini-flash-latest, then gemini-3.1-flash-lite
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });
        const text = response.text?.trim();
        if (text) {
          return { text, model };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('Resource has been exhausted');

        if (isTemporary) {
          if (attempt === 0) {
            // Short backoff before retry
            await new Promise((resolve) => setTimeout(resolve, 600));
            continue;
          }
          console.warn(`Model ${model} in high demand/unavailable. Cascading to next candidate...`);
          break;
        } else {
          console.warn(`Issue calling ${model}:`, errMsg);
          break;
        }
      }
    }
  }

  return null;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NIVA Menstrual Wellness & AI Companion Engine',
  });
});

// Endpoint: AI Daily Cycle Insights
app.post('/api/cycle-insights', async (req: Request, res: Response) => {
  try {
    const {
      cycleDay = 14,
      cycleLength = 28,
      phase = 'Ovulation',
      symptoms = [],
      mood = 'Balanced',
      crampsLevel = 0,
      flow = 'None',
      wellness = {},
    } = req.body;

    const prompt = `
You are NIVA's certified clinical wellness AI companion for women's cycle health.
The user is tracking their menstrual cycle with NIVA.
Current User Cycle Data:
- Cycle Day: Day ${cycleDay} of ${cycleLength}-day cycle
- Current Menstrual Phase: ${phase}
- Flow Level: ${flow}
- Pain / Cramps Level (0-5 scale): ${crampsLevel}/5
- Current Mood: ${mood}
- Logged Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'None reported today'}
- Wellness Info: Water: ${wellness.waterGlasses || 0} glasses, Sleep: ${wellness.sleepHours || 7}h (${wellness.sleepQuality || 'Good'}), Stress: ${wellness.stressLevel || 2}/5, Energy: ${wellness.energyLevel || 3}/5

Generate a personalized, empathetic, science-grounded hormonal & lifestyle breakdown for today.
Requirements:
1. "hormonalStatus": Explain what estrogen, progesterone, or LH are doing in this specific phase in warm, easy, non-intimidating language.
2. "energyGuidance": What type of movement/exercise fits this hormonal state (e.g. gentle walks, yin yoga, pilates, strength training, HIIT) and mental focus tips.
3. "nutritionFocus": 2-3 specific foods, herbs, or micronutrients (e.g., magnesium, iron, cruciferous veggies, hydration) beneficial right now.
4. "comfortTip": A comforting, uplifting 1-2 sentence self-care ritual or mindfulness reminder.
5. "phaseAffirmation": A brief empowering one-sentence affirmation honoring the body's natural biorhythm.
6. "disclaimer": Must state: "NIVA AI insights provide educational lifestyle guidance and are not medical diagnoses or treatment plans. Consult a qualified healthcare professional for medical concerns."

Respond with valid JSON matching the schema.
`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await generateWithRetryAndFallback(prompt, {
          systemInstruction:
            'You are a compassionate, medically-informed, supportive women\'s health and hormonal wellness guide for NIVA. Be empowering, clear, never clinical or robotic, and always maintain medical disclaimer standards. Do not mention any commercial products or brands.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hormonalStatus: { type: Type.STRING },
              energyGuidance: { type: Type.STRING },
              nutritionFocus: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              comfortTip: { type: Type.STRING },
              phaseAffirmation: { type: Type.STRING },
              disclaimer: { type: Type.STRING },
            },
            required: [
              'hormonalStatus',
              'energyGuidance',
              'nutritionFocus',
              'comfortTip',
              'phaseAffirmation',
              'disclaimer',
            ],
          },
        });

        if (result?.text) {
          const parsed = JSON.parse(result.text);
          return res.json({ success: true, insights: parsed, source: result.model });
        }
      } catch (geminiError) {
        console.warn('Gemini cycle insights temporary issue, falling back to clinical matrix:', geminiError);
      }
    }

    // High quality clinical fallback
    const fallbackMap: Record<string, any> = {
      Menstrual: {
        hormonalStatus:
          'Progesterone and estrogen are at their lowest baseline levels as your uterine lining sheds. Your body naturally calls for restoration and quiet renewal.',
        energyGuidance:
          'Prioritize slow restorative movement such as yin yoga, slow strolls, gentle pelvic stretching, or deep rest. Allow extra 30-45 minutes of rest if possible.',
        nutritionFocus: [
          'Iron-rich warm foods (lentils, spinach, beets, pumpkin seeds) to replenish lost iron',
          'Anti-inflammatory warm ginger, chamomile, or raspberry leaf tea for cramp relief',
          'Warm bone broth or mineral-rich vegetable soups and steady hydration',
        ],
        comfortTip:
          'A warm heat pack on your lower abdomen helps relax uterine muscles. Be tender with your energy today.',
        phaseAffirmation:
          'Resting is not unproductive; it is the biological foundation for renewal.',
        disclaimer:
          'NIVA AI insights provide educational lifestyle guidance and are not medical diagnoses or treatment plans. Consult a qualified healthcare professional for medical concerns.',
      },
      Follicular: {
        hormonalStatus:
          'Estrogen is climbing steadily as ovarian follicles mature. Serotonin and dopamine increase, bringing mental clarity, social confidence, and renewed stamina.',
        energyGuidance:
          'Your physical resilience is peaking. Great phase to try higher-tempo workouts, cardio, strength circuits, and tackle creative brainstorming projects.',
        nutritionFocus: [
          'Fermented foods (kefir, kimchi, yogurt) to support gut microbiome & optimal estrogen metabolism',
          'Sprouted grains, seeds, avocado, and lean proteins for sustained energy',
          'Citrus fruits and colorful berries rich in Vitamin C and antioxidants',
        ],
        comfortTip:
          'Notice your rising confidence and enthusiasm. Channel this natural biological surge into your creative passions.',
        phaseAffirmation:
          'Your energy is naturally expanding—embrace curiosity and new beginnings.',
        disclaimer:
          'NIVA AI insights provide educational lifestyle guidance and are not medical diagnoses or treatment plans. Consult a qualified healthcare professional for medical concerns.',
      },
      Ovulation: {
        hormonalStatus:
          'Estrogen peaks and Luteinizing Hormone (LH) surges, triggering egg release. Body temperature slightly rises, libido typically peaks, and communication pathways are at their monthly high.',
        energyGuidance:
          'High physical endurance and strength! Ideal for personal records in fitness, social gatherings, presentations, and collaborative teamwork.',
        nutritionFocus: [
          'Glutathione-supporting foods (asparagus, broccoli, bell peppers) to help liver metabolize peak estrogen',
          'Hydrating foods like watermelon, celery, and cucumber with pinch of electrolytes',
          'Omega-3 fatty acids from wild salmon, walnuts, and chia seeds',
        ],
        comfortTip:
          'You are in your natural communicative prime. Connect with loved ones or celebrate a personal milestone.',
        phaseAffirmation:
          'You are at peak magnetic vibrancy—radiate confidence and express yourself.',
        disclaimer:
          'NIVA AI insights provide educational lifestyle guidance and are not medical diagnoses or treatment plans. Consult a qualified healthcare professional for medical concerns.',
      },
      Luteal: {
        hormonalStatus:
          'Progesterone rises to support the uterine lining, then begins to decline if fertilization does not occur. Metabolism increases by ~100-200 calories per day.',
        energyGuidance:
          'Switch from intense high-impact training to Pilates, strength training with moderate weights, and gentle walks as PMS vulnerability rises.',
        nutritionFocus: [
          'Magnesium-rich foods (dark chocolate 70%+, pumpkin seeds, almonds) to ease muscle tension & stabilize mood',
          'Complex carbohydrates (sweet potatoes, oats, quinoa) to keep serotonin steady and curb cravings',
          'Dandelion root tea or warm peppermint tea to support fluid balance and reduce water retention',
        ],
        comfortTip:
          'Protect your personal boundaries and establish a calming bedtime wind-down ritual with warm lighting.',
        phaseAffirmation:
          'Your intuition is sharpest right now; listen to what your body is whispering.',
        disclaimer:
          'NIVA AI insights provide educational lifestyle guidance and are not medical diagnoses or treatment plans. Consult a qualified healthcare professional for medical concerns.',
      },
    };

    const phaseKey = phase in fallbackMap ? phase : 'Menstrual';
    return res.json({ success: true, insights: fallbackMap[phaseKey], source: 'clinical-matrix' });
  } catch (error: any) {
    console.error('Error generating cycle insights:', error);
    return res.status(500).json({
      error: 'Failed to generate AI insights',
      message: error?.message || 'Server error',
    });
  }
});

// Endpoint: Ask NIVA AI Companion & Conversational Chat
app.post('/api/ask-niva', async (req: Request, res: Response) => {
  try {
    const { question, cycleContext, messages = [] } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const contextStr = cycleContext
      ? `User cycle background (voluntarily shared): Current Day ${cycleContext.cycleDay || 14} of ${cycleContext.cycleLength || 28}-day cycle, Phase: ${cycleContext.phase || 'Unknown'}, Flow: ${cycleContext.flow || 'None'}, Cramps: ${cycleContext.crampsLevel || 0}/5, Mood: ${cycleContext.mood || 'Not specified'}, Logged Symptoms: ${cycleContext.symptoms?.join(', ') || 'None'}.`
      : 'User has chosen not to attach cycle data for this query.';

    const conversationHistoryStr = messages.length > 0
      ? `Recent Conversation:\n${messages.slice(-4).map((m: any) => `${m.role === 'user' ? 'User' : 'NIVA'}: ${m.content}`).join('\n')}\n`
      : '';

    const prompt = `
You are NIVA's certified clinical wellness AI companion for women's cycle and hormonal health.
${contextStr}

${conversationHistoryStr}
User question: "${question}"

Provide a compassionate, medically-responsible, empowering response (around 120-220 words).
Guidelines:
1. Warm, direct answer grounded in menstrual physiology, endocrinology, and practical evidence-based wellness.
2. Provide 2-3 actionable, comforting self-care, nutrition, or cycle-aware lifestyle steps.
3. If warning signs or red flags exist (such as severe fever, soaking through a pad/tampon every hour for 2+ consecutive hours, sudden unmanageable pain, severe depression), gently advise prompt clinical consultation.
4. NEVER claim to diagnose, cure, or prescribe.
5. Conclude with: "Reminder: NIVA AI provides general wellness information and does not replace professional medical advice."
`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await generateWithRetryAndFallback(prompt, {
          systemInstruction:
            'You are NIVA\'s empathetic menstrual health specialist. Be gentle, empowering, scientifically accurate, and always prioritize female health safety. Never include commercial or shopping links.',
        });

        if (result?.text) {
          return res.json({ success: true, answer: result.text, source: result.model });
        }
      } catch (geminiError) {
        console.warn('Gemini ask-niva temporary issue, using clinical response:', geminiError);
      }
    }

    // High quality clinical fallback tailored to user query
    let tailoredAnswer = `Thank you for checking in with NIVA. Understanding your body's hormonal rhythm is one of the most powerful steps toward lifelong menstrual wellness.

Here are key evidence-based recommendations:
• Stay consistently hydrated with warm fluids and electrolytes; gentle heat therapy increases pelvic circulation and relaxes uterine contractions.
• Balance your blood sugar with complex carbs and protein to help stabilize mood and hormonal fluctuations.
• Log your symptoms consistently in NIVA over 2-3 cycles to detect individual patterns and phase triggers.

Important warning signs: If you ever experience sudden, severe debilitating pain, fever, or soak through a pad/tampon every hour for 2 or more consecutive hours, please contact a physician or urgent care immediately.

Reminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;

    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('tired') || lowerQ.includes('fatigue')) {
      tailoredAnswer = `Feeling tired or experiencing fatigue is common across cycle transitions. In the late luteal phase (just before your period), both estrogen and progesterone drop rapidly, which influences serotonin and can make sleep lighter or leave you feeling less energized.

Comforting steps you can take today:
1. Hydrate with warm water and electrolytes; mild dehydration amplifies biological fatigue.
2. Nourish with iron-rich foods (spinach, lentils, pumpkin seeds) and magnesium to support cellular energy.
3. Allow yourself 15–20 minutes of restorative rest or gentle legs-up-the-wall stretching rather than forcing high-intensity workouts.

Warning note: If exhaustion is severe, chronic, or accompanied by extreme dizziness or shortness of breath, please consult a healthcare provider to test ferritin and thyroid levels.

Reminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
    } else if (lowerQ.includes('cramp') || lowerQ.includes('pain')) {
      tailoredAnswer = `Menstrual cramps (dysmenorrhea) are caused by prostaglandins—hormone-like compounds that cause uterine smooth muscles to contract to shed the lining.

Evidence-based relief methods:
1. Local Heat Therapy: Applying a heat pack or warm hot water bottle (approx 40°C / 104°F) to your lower abdomen or lower back relaxes smooth muscles as effectively as mild analgesics.
2. Herbal Infusions: Warm fresh ginger or chamomile tea acts as a gentle anti-spasmodic and COX-2 inhibitor.
3. Gentle Pelvic Movement: Child's pose and slow cat-cow stretching improve pelvic blood flow.

Warning note: If cramps are sudden, debilitating, not relieved by standard over-the-counter care, or prevent daily activities, please consult a gynecologist to rule out conditions like endometriosis or adenomyosis.

Reminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
    } else if (lowerQ.includes('phase')) {
      tailoredAnswer = `Your cycle has four distinct biological phases: Menstrual (shedding & renewal), Follicular (estrogen rise & creative stamina), Ovulation (peak magnetic vitality & LH surge), and Luteal (progesterone rise, inward focus & metabolic shift).

Syncing with your phase:
• Honor your natural stamina: High-intensity workouts and bold projects harmonize best in follicular and ovulation windows.
• Protect downtime: Slower movement, complex carbohydrates, and earlier bedtimes harmonize best in luteal and early menstrual days.

Reminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
    }

    return res.json({
      success: true,
      answer: tailoredAnswer,
      source: 'clinical-matrix',
    });
  } catch (error: any) {
    console.error('Error answering question:', error);
    return res.status(500).json({
      error: 'Failed to process question',
      message: error?.message || 'Server error',
    });
  }
});

// Endpoint: AI Cycle Pattern Summary Report
app.post('/api/ai/summary-insights', async (req: Request, res: Response) => {
  try {
    const { stats, logsSummary = [], recentMoods = [], recentSymptoms = [] } = req.body;

    const prompt = `
You are NIVA's Chief Menstrual Health Analyst.
Analyze the user's voluntary tracking records to generate a comprehensive, empowering, 3-part personalized cycle wellness report.

User Cycle Summary:
- Average Cycle Length: ${stats?.averageCycleLength || 28} days
- Average Period Duration: ${stats?.averagePeriodLength || 5} days
- Regularity Score: ${stats?.regularity || 'Regular'}
- Frequent Symptoms: ${recentSymptoms.length > 0 ? recentSymptoms.join(', ') : 'Mild cramps, occasional bloating'}
- Frequent Moods: ${recentMoods.length > 0 ? recentMoods.join(', ') : 'Calm, Energetic, occasional fatigue in luteal phase'}
- Total Logged Days: ${logsSummary.length || 10}

Generate a JSON response with:
1. "overview": An empowering summary of their cycle regularity and general hormonal balance (2-3 sentences).
2. "patternObservations": Array of 3 bulleted insights correlating their symptoms or moods to cycle phases.
3. "proactiveWellnessTips": Array of 3 personalized, science-backed lifestyle habits for their next cycle (nutrition, sleep, or stress management).
4. "disclaimer": Must state: "NIVA AI observations are based solely on self-reported data and are for educational insight, not medical diagnosis."
`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await generateWithRetryAndFallback(prompt, {
          systemInstruction:
            'You are NIVA\'s empathetic women\'s health scientist. Highlight strength, biological rhythm awareness, and clear distinctions between user data and AI interpretation.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              patternObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              proactiveWellnessTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              disclaimer: { type: Type.STRING },
            },
            required: [
              'overview',
              'patternObservations',
              'proactiveWellnessTips',
              'disclaimer',
            ],
          },
        });

        if (result?.text) {
          const parsed = JSON.parse(result.text);
          return res.json({ success: true, report: parsed, source: result.model });
        }
      } catch (geminiError) {
        console.warn('Gemini summary insights issue, using clinical pattern report:', geminiError);
      }
    }

    // High quality fallback report
    return res.json({
      success: true,
      report: {
        overview: `Your cycle demonstrates a steady ${stats?.averageCycleLength || 28}-day rhythm with consistent follicular and luteal phases. Your logged wellness data shows strong bodily self-awareness across your monthly transitions.`,
        patternObservations: [
          'Energy and focus peak predictably during days 10-15 (late follicular through ovulation) as estrogen surges.',
          'Mild cramping and fatigue concentrate in days 1-2 of menstruation, rapidly improving by day 3.',
          'Heightened sensitivity and cravings tend to cluster in late luteal phase (days 23-27), corresponding to natural progesterone shifts.',
        ],
        proactiveWellnessTips: [
          'Increase dietary magnesium (pumpkin seeds, spinach, dark chocolate) 5 days before your predicted period to soothe prostaglandins.',
          'Schedule lighter evening commitments during days 25-28 to allow for natural restorative downtime.',
          'Maintain steady water hydration (aim for 6-8 glasses) to help ease water retention and reduce pelvic bloating.',
        ],
        disclaimer:
          'NIVA AI observations are based solely on self-reported data and are for educational insight, not medical diagnosis.',
      },
      source: 'clinical-matrix',
    });
  } catch (error: any) {
    console.error('Error generating summary insights:', error);
    return res.status(500).json({
      error: 'Failed to generate summary report',
      message: error?.message || 'Server error',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 NIVA Menstrual Wellness Server running on port ${PORT}`);
  });
}

startServer();
