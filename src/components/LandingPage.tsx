import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Heart,
  Activity,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Droplet,
  Lock,
  MessageCircle,
  Compass,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenLogin: () => void;
  onOpenAppDirectly: () => void;
}

const FAQS = [
  {
    q: 'How does NIVA calculate my cycle and period predictions?',
    a: 'NIVA uses clinical menstrual cycle algorithms combined with your personal historical data. As you log your period start and end dates across multiple cycles, NIVA continuously improves the accuracy of predicted flow windows, ovulation day, and fertile windows.',
  },
  {
    q: 'What makes NIVA AI different from generic chat tools?',
    a: 'NIVA AI is specifically calibrated with evidence-based gynecological, endocrine, and menstrual hygiene knowledge. When you voluntary enable cycle context, it tailors guidance directly to your current hormonal phase, cramps level, and logged symptoms without ever selling your health data.',
  },
  {
    q: 'Is my sensitive menstrual health data safe and private?',
    a: 'Yes, completely. Privacy is our founding design principle. We never sell, rent, or broker your health data to third-party advertisers or data brokers. You maintain full ownership with one-click JSON data export and permanent account deletion tools.',
  },
  {
    q: 'Can NIVA diagnose medical conditions?',
    a: 'No. NIVA and NIVA AI provide general wellness education and lifestyle tracking. NIVA does not replace licensed medical diagnosis or clinical treatment. If severe pain, excessive bleeding, or abnormal symptoms occur, our Emergency Guide directs you to professional care.',
  },
  {
    q: 'Is NIVA free to use without commercial product purchases?',
    a: 'Yes. NIVA is strictly a digital menstrual wellness platform and AI companion. There are no online stores, sanitary pad checkout carts, or commercial e-commerce obligations.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Elena R.',
    role: 'Product Designer',
    quote:
      'NIVA completely changed how I plan my workouts and meetings. Knowing I am in my luteal phase helped me give myself grace instead of feeling guilty for needing rest.',
  },
  {
    name: 'Priya M.',
    role: 'Medical Student',
    quote:
      'The clinical accuracy of the cycle phases and the evidence-based cramp relief advice are exceptional. It is so refreshing to have an app that treats health data with true privacy.',
  },
  {
    name: 'Sarah K.',
    role: 'Teacher & Marathoner',
    quote:
      'The AI companion feels like having an empathetic wellness specialist in my pocket. Simple, soothing design without stereotypical gimmicks.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenLogin,
  onOpenAppDirectly,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-stone-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-rose-200">
              N
            </span>
            <span className="text-xl font-black text-stone-900 tracking-tight font-serif-accent">
              NIVA
            </span>
            <span className="hidden sm:inline-block text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Menstrual Wellness & AI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenLogin}
              className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-50/60 via-purple-50/30 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Intelligent, Privacy-First Menstrual Health</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-stone-950 font-serif-accent leading-[1.15]">
            Harmonize with Your Biology.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">
              Own Your Cycle.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            NIVA combines clinical cycle science, empathetic AI companion guidance, and deep hormonal insights into an empowering, privacy-guaranteed wellness ecosystem.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              <span>Create Your NIVA Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAppDirectly}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-sm shadow-2xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Live App Demo</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-medium">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Health Data Brokering</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>Client-Side Isolation & PIN Lock</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Gemini 3.8 Flash AI Engine</span>
            </span>
          </div>
        </div>
      </section>

      {/* How NIVA Works */}
      <section className="py-16 sm:py-24 bg-stone-50/60 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Intuitive & Science-Grounded
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif-accent">
              How NIVA Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
              Three seamless steps from initial tracking to intuitive hormonal synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mb-2">
                1
              </div>
              <h3 className="font-bold text-base text-stone-900">Track Intuitively</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Log flow, cramps severity, moods, sleep, and hydration in seconds. Differentiate predicted dates from confirmed dates effortlessly.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg mb-2">
                2
              </div>
              <h3 className="font-bold text-base text-stone-900">Understand Hormonal Shifts</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Watch how estrogen, progesterone, and LH naturally dictate your stamina, focus, and metabolic requirements across all four phases.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-2">
                3
              </div>
              <h3 className="font-bold text-base text-stone-900">AI-Powered Guidance</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ask NIVA AI any question with context-aware personalization, discover recurring symptom patterns, and receive proactive lifestyle habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Showcase */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Built for Modern Women
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif-accent">
            Engineered for Total Cycle Wellbeing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Interactive Cycle Dial & Calendar
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Visualize your current cycle day, phase progress, estimated period windows, and fertile window with our circular dial and interactive monthly calendar.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Conversational NIVA AI Companion
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A private, supportive companion ready to explain why fatigue spikes, suggest foods for your phase, or ease anxiety about cycle changes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Symptom & Wellness Analytics
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Track cramps, bloating, mood shifts, hydration, sleep duration, and stress. Identify phase-correlated recurring trends across cycles.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Privacy-First & Data Ownership
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Export your data in standard JSON, wipe history with one click, activate 4-digit PIN lock, or enable discreet mode for crowded spaces.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-stone-50/60 border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Community Voices
            </span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif-accent">
              Loved by Women Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3"
              >
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="pt-2 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-900">{t.name}</h4>
                  <span className="text-[11px] text-stone-400">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight font-serif-accent">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-stone-900 hover:bg-stone-50/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-stone-900 via-stone-800 to-rose-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-serif-accent">
            Begin Your Hormonal Wellness Journey Today
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
            Free forever for personal tracking. Zero advertisements. No health data selling.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/40 transition-all hover:scale-[1.02]"
            >
              Create Your NIVA Account
            </button>
            <button
              onClick={onOpenAppDirectly}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs sm:text-sm border border-stone-700 transition-colors"
            >
              Launch Web App
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-[10px]">
              N
            </span>
            <span className="font-bold text-stone-200">NIVA Menstrual Wellness</span>
          </div>

          <p className="text-[11px] text-stone-500">
            © {new Date().getFullYear()} NIVA. Digital Menstrual Health & AI Companion Platform. Not medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
};
