import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Smile,
  ShieldCheck,
  HelpCircle,
  Activity,
  Droplet,
  Info,
} from 'lucide-react';
import { RegularityStatus, TrackingPreferences } from '../types';
import { formatDate } from '../utils/cycleCalculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    ageRange: string;
    lastPeriod: string;
    cycleLength: number;
    periodDuration: number;
    regularity: RegularityStatus;
    trackingPreferences: TrackingPreferences;
  }) => void;
  userName?: string;
}

const AGE_RANGES = [
  'Under 18',
  '18–24',
  '25–34',
  '35–44',
  '45+',
  'Prefer not to say',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userName = '',
}) => {
  const [step, setStep] = useState<number>(1);

  // Initial field states
  const [preferredName, setPreferredName] = useState<string>(
    userName && userName !== 'there' && userName !== 'NIVA Guest' ? userName : ''
  );
  const [ageRange, setAgeRange] = useState<string>('25–34');
  
  // 12 days ago as sensible initial starting date
  const defaultDate = formatDate(new Date(Date.now() - 12 * 86400000));
  const [lastPeriod, setLastPeriod] = useState<string>(defaultDate);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [isCycleLengthUnsure, setIsCycleLengthUnsure] = useState<boolean>(false);
  const [periodDuration, setPeriodDuration] = useState<number>(5);
  const [regularity, setRegularity] = useState<RegularityStatus>('Regular');

  // Tracking preferences
  const [trackSymptoms, setTrackSymptoms] = useState<boolean>(true);
  const [trackMood, setTrackMood] = useState<boolean>(true);
  const [trackWellness, setTrackWellness] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      name: preferredName.trim() || userName || 'You',
      ageRange,
      lastPeriod,
      cycleLength: isCycleLengthUnsure ? 28 : cycleLength,
      periodDuration,
      regularity,
      trackingPreferences: {
        trackSymptoms,
        trackMood,
        trackWellness,
      },
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Friendly Welcome & Progress Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Step {step} of 4
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {step === 1 && 'Welcome & Profile'}
              {step === 2 && 'Cycle Dates'}
              {step === 3 && 'Cycle Regularity'}
              {step === 4 && 'Your Preferences'}
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="text-xs text-stone-400 hover:text-stone-700 font-semibold transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: Welcome & Preferred Name / Age */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2
                id="onboarding-title"
                className="text-2xl font-bold text-stone-900 tracking-tight font-serif-accent"
              >
                Welcome to NIVA 💜 Let’s personalize your experience.
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                We only ask what is needed to calculate your cycle day and calibrate your daily insights. You are always in control of your data.
              </p>
            </div>

            {/* Preferred Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                What is your preferred name?
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Maya, Elena, Alex..."
                className="w-full text-sm p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 font-medium text-stone-900 focus:outline-rose-500 focus:bg-white transition-all"
              />
              <p className="text-[11px] text-stone-400">
                How NIVA will address you in greetings and gentle check-ins.
              </p>
            </div>

            {/* Age or Age Range (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Age range <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AGE_RANGES.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAgeRange(range)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center border transition-all ${
                      ageRange === range
                        ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-[11px] text-purple-900/80 flex items-start space-x-2">
                <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Why we ask:</strong> Natural hormonal baselines, cycle lengths, and reproductive wellness priorities shift across life stages. This is optional and never shared.
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Last Period Date & Cycle Durations */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                When did your last period start?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                The first day you noticed menstrual bleeding. If you're not sure, select an estimate—you can adjust it anytime.
              </p>
            </div>

            {/* Date picker */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                First day of most recent flow
              </label>
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-white font-medium text-stone-900 focus:outline-rose-500"
              />
              <p className="text-[11px] text-stone-400">
                💡 <strong>Why we ask:</strong> This anchors your cycle calendar to calculate your current cycle day and estimate your next period.
              </p>
            </div>

            {/* Average Cycle Length */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-700">Average cycle length</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {isCycleLengthUnsure ? '28 Days (Standard default)' : `${cycleLength} Days`}
                </span>
              </div>
              {!isCycleLengthUnsure ? (
                <>
                  <input
                    type="range"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>21 days</span>
                    <span>28 days (Average)</span>
                    <span>45 days</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  Using standard 28 days until you record more cycles.
                </p>
              )}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCycleLengthUnsure(!isCycleLengthUnsure)}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                >
                  {isCycleLengthUnsure ? '← Select custom days' : "I don't know / Not sure"}
                </button>
              </div>
            </div>

            {/* Period Duration */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-stone-700">Average period flow duration</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {periodDuration} Days
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(Number(e.target.value))}
                className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>2 days</span>
                <span>5 days (Typical)</span>
                <span>10 days</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Cycle Regularity */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Are your cycles generally regular or irregular?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Menstrual cycles naturally vary. Letting us know helps NIVA tailor prediction confidence.
              </p>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    id: 'Regular',
                    label: 'Regular',
                    desc: 'Starts consistently within 1–2 days of prediction',
                  },
                  {
                    id: 'Somewhat Irregular',
                    label: 'Somewhat Irregular',
                    desc: 'Varies by a few days each month',
                  },
                  {
                    id: 'Irregular',
                    label: 'Irregular',
                    desc: 'Varies by more than a week or hard to predict',
                  },
                  {
                    id: 'Not sure',
                    label: 'Not sure / First time tracking',
                    desc: 'First time tracking or postpartum/perimenopausal',
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRegularity(opt.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    regularity === opt.id
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30 text-purple-950 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[11px] text-stone-500">{opt.desc}</span>
                  </div>
                  {regularity === opt.id && (
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-[11px] text-stone-500 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Why we ask:</strong> If your cycle is irregular, NIVA presents predictions as wider estimated ranges rather than rigid dates, protecting your peace of mind.
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: What would you like to track? */}
        {step === 4 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                What would you like to track?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Choose optional areas you'd like to personalize. You can always change these later in Profile Settings.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Symptoms */}
              <div
                onClick={() => setTrackSymptoms(!trackSymptoms)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  trackSymptoms
                    ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-400/30'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-2xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Physical Symptoms & Pain
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Cramps, headaches, bloating, fatigue, breast tenderness
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={trackSymptoms}
                  onChange={() => {}}
                  className="accent-rose-600 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {/* Mood */}
              <div
                onClick={() => setTrackMood(!trackMood)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  trackMood
                    ? 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400/30'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-2xs">
                    <Smile className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Mood & Emotional Rhythms
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Track calmness, energy spikes, stress, and mood shifts
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={trackMood}
                  onChange={() => {}}
                  className="accent-purple-600 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {/* Daily Wellness */}
              <div
                onClick={() => setTrackWellness(!trackWellness)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  trackWellness
                    ? 'bg-teal-50/80 border-teal-300 ring-1 ring-teal-400/30'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-2xs">
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Daily Wellness & Sleep
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Hydration, sleep hours, activity, and restorative rest
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={trackWellness}
                  onChange={() => {}}
                  className="accent-teal-600 w-4 h-4 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-500 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy guarantee:</strong> NIVA never sells your data. No unnecessary questions are asked, and all logs are securely synced to your private account.
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to My Dashboard 🌸</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
