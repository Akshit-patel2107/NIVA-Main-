export interface ClinicalMatrixQuery {
  question: string;
  cycleContext?: {
    cycleDay?: number;
    phase?: string;
    flow?: string;
    crampsLevel?: number;
    mood?: string;
  };
  responseMode?: 'quick' | 'balanced' | 'detailed';
}

export function generateClinicalMatrixResponse(query: ClinicalMatrixQuery): string {
  const { question, cycleContext, responseMode = 'balanced' } = query;
  const lowerQ = question.toLowerCase();

  const cycleContextSnippet = cycleContext
    ? `On Day ${cycleContext.cycleDay ?? 14} in your ${cycleContext.phase ?? 'current'} phase, your body's hormonal rhythm naturally guides your stamina and physical comfort.`
    : `Honoring your personal monthly rhythm is one of the most effective ways to nurture holistic wellbeing.`;

  if (lowerQ.includes('tired') || lowerQ.includes('fatigue') || lowerQ.includes('exhaust')) {
    if (responseMode === 'quick') {
      return `Fatigue during cycle shifts is typically driven by rapid drops in progesterone and estrogen before menstruation, or elevated basal body metabolism in the luteal phase.\n\nQuick steps:\n1. Drink 1-2 glasses of warm water with electrolytes.\n2. Enjoy magnesium-rich foods (pumpkin seeds, dark chocolate 70%+).\n3. Take a 20-minute restorative rest or gentle legs-up-the-wall stretch.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
    }
    return `${cycleContextSnippet} Fatigue and low energy are common cycle transitions. During the late luteal phase and early menstrual days, sharp declines in estrogen and progesterone influence serotonin pathways and can make deep REM sleep lighter.\n\nEvidence-based wellness steps:\n• Hydration with Electrolytes: Mild dehydration amplifies hormonal exhaustion. Warm herbal teas (chamomile, rooibos) enhance circulation.\n• Iron & Magnesium Replenishment: Incorporate pumpkin seeds, lentils, spinach, and almonds to nourish oxygen transport and cellular energy.\n• Paced Movement: Prioritize gentle walks or restorative yin yoga over high-intensity cardiovascular strain when feeling depleted.\n\nWarning Note: If exhaustion is severe, chronic, or accompanied by extreme dizziness or shortness of breath, please consult a healthcare provider to evaluate ferritin and thyroid balance.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
  }

  if (lowerQ.includes('cramp') || lowerQ.includes('pain') || lowerQ.includes('ache')) {
    if (responseMode === 'quick') {
      return `Menstrual cramps (dysmenorrhea) are triggered by prostaglandins causing uterine contractions. Evidence-based relief:\n1. Apply continuous heat (hot water bottle or heating pad at ~40°C/104°F) to your lower abdomen.\n2. Sip warm ginger or peppermint tea.\n3. Try gentle child's pose stretching.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
    }
    return `${cycleContextSnippet} Menstrual cramps (dysmenorrhea) are primarily driven by prostaglandins—chemical messengers that prompt the uterine smooth muscle to contract and shed the endometrial lining.\n\nClinically-grounded soothing methods:\n• Targeted Heat Therapy: Applying a heat pack or hot water bottle to your lower abdomen relaxes uterine contractions as effectively as mild over-the-counter analgesics.\n• Anti-inflammatory Botanicals: Fresh ginger root tea acts as a natural COX-2 inhibitor, helping reduce prostaglandin production.\n• Pelvic Circulation: Gentle mobility exercises, including child's pose and supine twists, ease lower back stiffness and pelvic congestion.\n\nImportant warning: If cramps are sudden, excruciating, not relieved by standard care, or prevent daily functioning, please consult a gynecologist to rule out conditions like endometriosis or fibroids.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
  }

  if (lowerQ.includes('pms') || lowerQ.includes('mood') || lowerQ.includes('irritab') || lowerQ.includes('anxiety')) {
    return `${cycleContextSnippet} Premenstrual Syndrome (PMS) reflects natural shifts in progesterone and estrogen during the luteal phase, which temporarily alter GABA and serotonin neurotransmitters in the brain.\n\nSupportive lifestyle protocols:\n• Blood Sugar Stability: Pair complex carbohydrates (sweet potatoes, oats, quinoa) with protein to prevent dopamine dips and irritability.\n• Vitamin B6 & Magnesium: Support neurotransmitter synthesis through leafy greens, bananas, and seeds.\n• Mindful Boundaries: Create a quiet evening wind-down routine with dim lighting and soothing music.\n\nIf premenstrual symptoms feel overwhelming or trigger severe depressive episodes (PMDD), discussing therapeutic support with a compassionate doctor is strongly recommended.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
  }

  if (lowerQ.includes('phase') || lowerQ.includes('cycle') || lowerQ.includes('follicular') || lowerQ.includes('ovulation') || lowerQ.includes('luteal')) {
    return `Your cycle consists of four distinct biological chapters:\n\n1. Menstrual Phase (Days 1–5): Hormones are at baseline; focus on replenishment, warming mineral soups, and gentle rest.\n2. Follicular Phase (Days 6–12): Estrogen climbs steadily, boosting brain chemistry, social stamina, and physical endurance.\n3. Ovulatory Window (Days 13–16): Estrogen peaks and LH surges, bringing your highest confidence, communicative ease, and strength.\n4. Luteal Phase (Days 17–28): Progesterone dominates, directing focus inward and increasing caloric needs by ~100–200 calories per day.\n\nListening to your current phase helps align workout intensity and workload with your internal biorhythm.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
  }

  if (lowerQ.includes('pattern') || lowerQ.includes('analyz') || lowerQ.includes('track')) {
    return `Tracking your cycle patterns over 2–3 consecutive cycles reveals your personal biological signatures. Most women observe:\n\n• Energy and cognitive focus peak predictably during late follicular through ovulation.\n• Mild fluid retention and cravings cluster 3–5 days prior to menstruation due to progesterone fluctuations.\n• Pelvic sensitivity and cramping are typically highest on days 1–2 of flow.\n\nConsistent daily logs in NIVA empower you to proactively schedule rest and nourishing meals before PMS triggers arise.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
  }

  // General compassionate default
  return `${cycleContextSnippet} Listening attentively to what your body signals is the cornerstone of sustainable hormonal health.\n\nCore wellness recommendations:\n• Hydrate Steadily: Warm water and herbal infusions encourage optimal lymphatic flow and digestive ease.\n• Nutrient Density: Incorporate leafy greens, healthy fats (avocado, olive oil, seeds), and warm whole grains.\n• Restorative Rest: Ensure consistent 7–9 hours of sleep to support nighttime endocrine balance.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`;
}
