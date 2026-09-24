import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Heart,
  Droplet,
  ShieldCheck,
  HelpCircle,
  Sun,
  Moon,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronRight,
  X,
  Apple,
  Activity,
  Smile,
} from 'lucide-react';

interface Article {
  id: string;
  category: 'phases' | 'symptoms' | 'nutrition' | 'hygiene' | 'emotional' | 'medical';
  title: string;
  readTime: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'art-phases-1',
    category: 'phases',
    title: 'Demystifying the Four Menstrual Phases',
    readTime: '4 min read',
    summary:
      'Understand how estrogen, progesterone, LH, and FSH fluctuate across your month, and how each phase shapes your stamina and cognition.',
    content: [
      'The menstrual cycle is often thought of as just "the period," but menstruation is only the first of four biologically distinct hormonal phases: Menstrual, Follicular, Ovulatory, and Luteal.',
      '1. Menstrual Phase (Days 1–5): Estrogen and progesterone drop to their lowest baseline. The endometrium sheds. Energy turns inward, calling for gentle restorative movement, iron replenishment, and deep rest.',
      '2. Follicular Phase (Days 6–13): The pituitary gland releases Follicle-Stimulating Hormone (FSH), prompting ovarian follicles to mature. Estrogen rises steadily, increasing serotonin and dopamine for sharper focus, creative optimism, and higher stamina.',
      '3. Ovulation Phase (Days 14–16): A surge in Luteinizing Hormone (LH) triggers the release of a mature egg. Estrogen peaks. Physical energy, social magnetism, and verbal fluency reach their monthly peak.',
      '4. Luteal Phase (Days 17–28): After ovulation, the ruptured follicle transforms into the corpus luteum, producing progesterone. Progesterone calms the central nervous system, but if fertilization does not happen, both hormones drop before the next cycle begins.',
    ],
    keyTakeaways: [
      'Your cycle is a fifth vital sign of whole-body wellness.',
      'Hormone shifts naturally dictate fluctuations in energy, mood, and metabolism.',
      'Tracking your symptoms allows you to plan your work and movement in harmony with your biology.',
    ],
  },
  {
    id: 'art-cramps-2',
    category: 'symptoms',
    title: 'Evidence-Based Relief for Menstrual Cramps (Dysmenorrhea)',
    readTime: '5 min read',
    summary:
      'What causes painful uterine contractions, why prostaglandins matter, and practical natural and clinical approaches to comfort.',
    content: [
      'Primary dysmenorrhea is caused by an overproduction of prostaglandins—inflammatory chemical messengers that cause uterine smooth muscles to contract to shed the lining.',
      'When prostaglandins are elevated, contractions restrict local blood flow, leading to oxygen deprivation in tissues and resulting in cramping, lower back aching, and sometimes digestive upset.',
      'Key Comfort Strategies:',
      '• Local Heat Therapy: Applying a heat wrap (40°C / 104°F) directly to the lower abdomen has been shown in clinical trials to be as effective as ibuprofen by improving microvascular blood flow.',
      '• Magnesium Glycinate: Magnesium acts as a natural smooth muscle relaxant and reduces prostaglandin synthesis. Taking it regularly in your luteal phase can ease cramp intensity.',
      '• Hydration & Anti-Inflammatory Teas: Fresh ginger root tea and chamomile tea possess natural antispasmodic and COX-2 inhibiting properties.',
    ],
    keyTakeaways: [
      'Cramps are caused by prostaglandins, not just muscular tension.',
      'Consistent heat therapy and dietary magnesium provide proven non-invasive relief.',
      'Severe pain that prevents daily functioning is NOT normal and warrants clinical evaluation for endometriosis or adenomyosis.',
    ],
  },
  {
    id: 'art-nutrition-3',
    category: 'nutrition',
    title: 'Cycle Syncing: Nutrition & Metabolic Needs',
    readTime: '4 min read',
    summary:
      'How your metabolic rate changes by 100–200 calories in the luteal phase and which micronutrients nourish each phase.',
    content: [
      'Your nutritional requirements are not identical every day of the month. Your basal metabolic rate (BMR) naturally increases by roughly 100 to 200 calories per day during the luteal phase.',
      '• Menstrual Phase: Prioritize bioavailable iron (lentils, spinach, beets, pumpkin seeds), Vitamin C (to enhance iron absorption), and warming broths to soothe digestion.',
      '• Follicular Phase: Support healthy estrogen clearance with cruciferous vegetables (broccoli, cauliflower, Brussels sprouts containing DIM) and probiotic-rich fermented foods.',
      '• Ovulatory Phase: Support liver metabolism with glutathione precursors (asparagus, spinach) and prioritize hydration and light, fiber-dense meals.',
      '• Luteal Phase: Combat cravings and stabilize serotonin by pairing complex carbohydrates (sweet potatoes, oats, brown rice) with protein. Snack on dark chocolate (70%+) for magnesium.',
    ],
    keyTakeaways: [
      'Hunger spikes in the luteal phase are biologically real—your body is burning more energy.',
      'Pairing complex carbohydrates with protein prevents mood dips and afternoon energy crashes.',
      'Cruciferous vegetables support healthy liver metabolism of estrogen.',
    ],
  },
  {
    id: 'art-hygiene-4',
    category: 'hygiene',
    title: 'Menstrual Hygiene, Skin Health & Preventing TSS',
    readTime: '4 min read',
    summary:
      'Best practices for skin breathability, rash prevention, changing intervals, and understanding Toxic Shock Syndrome.',
    content: [
      'Maintaining optimal vulvar and vaginal skin health during menstruation requires understanding your delicate external microbiome.',
      '1. Change Frequency: Whether using disposable or reusable menstrual products, change every 4 to 6 hours during daytime. This keeps skin dry and prevents bacterial proliferation.',
      '2. Preventing Friction & Rashes: Moisture and heat can lead to contact dermatitis. Breathable, fragrance-free, chlorine-free materials reduce friction and preserve skin integrity.',
      '3. Cleansing Best Practices: Wash only the external vulva with warm water or a gentle, fragrance-free cleanser. Never douche; the vagina is a self-cleaning internal organ.',
      '4. Toxic Shock Syndrome (TSS) Awareness: A rare but serious bacterial infection caused by Staphylococcus aureus or Streptococcus. Symptoms include sudden high fever (102°F+), sunburn-like rash, vomiting, diarrhea, and dizziness. If using tampons or cups, always adhere to maximum 8-hour wear limits.',
    ],
    keyTakeaways: [
      'Change menstrual products every 4 to 6 hours for skin freshness.',
      'Avoid scented wipes and harsh washes that disrupt natural pH.',
      'Fever, dizziness, or vomiting with tampon use requires immediate emergency evaluation.',
    ],
  },
  {
    id: 'art-sleep-stress-5',
    category: 'nutrition',
    title: 'Sleep, Stress Management & The Autonomic Nervous System',
    readTime: '4 min read',
    summary:
      'How cortisol, bedtime routines, and box breathing regulate hypothalamic-pituitary-ovarian signaling and reproductive hormones.',
    content: [
      'The menstrual cycle is orchestrated by the hypothalamus and pituitary gland in your brain. When chronic psychological or physical stress elevates cortisol, the brain can delay ovulation or alter cycle length.',
      '1. Sleep Architecture: Progesterone increases core body temperature slightly during the luteal phase, which can lead to vivid dreams or lighter sleep. Keeping your bedroom at 65–68°F (18–20°C) aids deeper sleep cycles.',
      '2. The 4-7-8 Breathing Technique: Inhaling for 4 seconds, holding for 7, and exhaling slowly for 8 activates the vagus nerve and stimulates the parasympathetic nervous system, lowering heart rate and pelvic muscle tension.',
      '3. Evening Digital Hygiene: Blue light suppresses melatonin synthesis. Dimming overhead bulbs and switching phones to night shift 60 minutes before bed supports natural hormonal rhythm transitions.',
    ],
    keyTakeaways: [
      'Chronic stress directly impacts cycle timing via hypothalamic signaling.',
      'Cooler room temperatures improve sleep quality in the luteal phase.',
      'Simple breathwork directly triggers the parasympathetic relaxation response.',
    ],
  },
  {
    id: 'art-emotional-6',
    category: 'emotional',
    title: 'Hormones, Mood Shifts & Understanding PMDD',
    readTime: '5 min read',
    summary:
      'Differentiating everyday premenstrual mood changes from Premenstrual Dysphoric Disorder (PMDD), and practical emotional coping tools.',
    content: [
      'Many women experience mild emotional sensitivity, irritability, or tearfulness 3 to 7 days before menstruation. This is linked to the rapid drop in estrogen and progesterone, which directly influences serotonin receptor sensitivity.',
      'PMS vs. PMDD: While Premenstrual Syndrome (PMS) causes manageable emotional and physical discomfort, Premenstrual Dysphoric Disorder (PMDD) is a recognized clinical neuroendocrine condition characterized by severe dysphoria, intense anger, debilitating anxiety, and feelings of hopelessness.',
      'Self-Care Interventions:',
      '• Light Exposure & Sleep Consistency: Getting 15 minutes of outdoor morning sunlight helps maintain steady circadian rhythms and nighttime melatonin release.',
      '• Boundary Protection: Recognize when your luteal phase begins and avoid scheduling high-stress confrontational meetings during days 25 to 28.',
      '• Psychological Support: Cognitive Behavioral Therapy (CBT) and targeted medical treatments can provide transformative relief for severe premenstrual distress.',
    ],
    keyTakeaways: [
      'Premenstrual mood changes reflect genuine neurochemical fluctuations.',
      'PMDD is an abnormal neurobiological reaction to normal hormonal shifts, not an emotional flaw.',
      'Consult a mental health or gynecological professional if mood changes disrupt your relationships or work.',
    ],
  },
  {
    id: 'art-medical-7',
    category: 'medical',
    title: 'When Should I Seek Medical Help? Warning Signs & Clinical Guidance',
    readTime: '5 min read',
    summary:
      'Clear, empowering guidelines on what is typical versus red-flag symptoms that warrant prompt consultation with a doctor.',
    content: [
      'Your menstrual cycle is considered a fifth vital sign of whole-body wellness. While mild cramping, slight mood variations, and moderate fluid retention are typical, severe pain or heavy bleeding should never be dismissed.',
      'Key Warning Signs (Red Flags):',
      '1. Heavy Menstrual Bleeding: Soaking through one or more sanitary pads or tampons every hour for two or more consecutive hours, or passing blood clots larger than a quarter.',
      '2. Debilitating Pain (Severe Dysmenorrhea): Cramping that does not respond to standard over-the-counter pain relievers and causes you to miss work, school, or bed rest.',
      '3. High Fever with Tampon / Cup Use: Sudden onset of 102°F+ fever, sunburn-like rash, dizziness, fainting, or vomiting during or immediately following menstruation (potential Toxic Shock Syndrome).',
      '4. Irregular or Absent Periods (Amenorrhea): Cycles consistently shorter than 21 days, longer than 35 days, or absence of periods for 90+ days when not pregnant or breastfeeding.',
      '5. Intermenstrual or Post-Coital Bleeding: Unexpected bleeding between periods or after intimacy.',
      '6. Severe Mood Distress (PMDD Symptoms): Premenstrual depression, intense despair, or anxiety that severely interferes with your quality of life.',
      'Always remember: You deserve compassionate, attentive medical care. Use your NIVA logs to present accurate historical patterns to your physician or gynecologist.',
    ],
    keyTakeaways: [
      'Bleeding through a pad every hour for 2+ consecutive hours is an urgent medical red flag.',
      'Severe pelvic pain is common, but it is NOT physiologically normal.',
      'Consult a board-certified gynecologist or primary care physician whenever symptoms interfere with your life.',
    ],
  },
];

export const CycleAcademy: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'phases' | 'symptoms' | 'nutrition' | 'hygiene' | 'emotional' | 'medical'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCategory =
      activeCategory === 'all' || art.category === activeCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Education Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-xs font-semibold border border-rose-400/30 text-rose-200">
            <BookOpen className="w-3.5 h-3.5" />
            <span>NIVA Clinical Education Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Knowledge is Your Biological Superpower
          </h2>
          <p className="text-xs sm:text-sm text-stone-300">
            Factual, accessible, and medically-reviewed insights into cycle phases, hormonal balance, symptom soothing, and pelvic wellness.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. cramps, PMS, luteal phase, nutrition, hygiene)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-rose-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Guides' },
            { id: 'phases', label: 'Cycle Phases' },
            { id: 'symptoms', label: 'Cramps & Symptoms' },
            { id: 'nutrition', label: 'Nutrition & Movement' },
            { id: 'hygiene', label: 'Hygiene & Safety' },
            { id: 'emotional', label: 'Mood & PMDD' },
            { id: 'medical', label: 'When to Seek Help' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArticles.length === 0 ? (
          <div className="md:col-span-2 bg-stone-50 rounded-3xl p-10 text-center text-stone-500 text-xs">
            No educational guides matched your search. Try different terms or browse All Guides.
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="uppercase tracking-wider font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    {art.category}
                  </span>
                  <span>{art.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>

              <div className="flex items-center text-xs font-semibold text-rose-600 pt-2 border-t border-stone-100">
                <span>Read full guide</span>
                <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                  NIVA Health Guide • {selectedArticle.readTime}
                </span>
                <h3 id="article-modal-title" className="text-base sm:text-lg font-bold text-stone-900">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                aria-label="Close guide"
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100 italic text-stone-700">
                {selectedArticle.summary}
              </div>

              <div className="space-y-4">
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Key Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedArticle.keyTakeaways.map((k, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3">
                Disclaimer: NIVA educational articles are curated for general wellness knowledge and do not substitute for professional medical counsel.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/60 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
