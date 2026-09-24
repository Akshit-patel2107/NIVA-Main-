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
  X,
  ShieldCheck,
} from 'lucide-react';
import { RegularityStatus } from '../types';
import { formatDate } from '../utils/cycleCalculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    lastPeriod: string;
    cycleLength: number;
    periodDuration: number;
    regularity: RegularityStatus;
    commonSymptoms: string[];
  }) => void;
  userName?: string;
}

const COMMON_SYMPTOMS_LIST = [
  'Cramps',
  'Bloating',
  'Tender Breasts',
  'Mood Swings',
  'Fatigue',
  'Headache',
  'Food Cravings',
  'Acne',
  'Back Pain',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userName = 'there',
}) => {
  const [step, setStep] = useState<number>(1);

  // Today minus 12 days as sensible starting default
  const defaultDate = formatDate(new Date(Date.now() - 12 * 86400000));
  const [lastPeriod, setLastPeriod] = useState<string>(defaultDate);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodDuration, setPeriodDuration] = useState<number>(5);
  const [regularity, setRegularity] = useState<RegularityStatus>('Regular');
  const [commonSymptoms, setCommonSymptoms] = useState<string[]>(['Cramps', 'Bloating']);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setCommonSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleFinish = () => {
    onComplete({
      lastPeriod,
      cycleLength,
      periodDuration,
      regularity,
      commonSymptoms,
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
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Step {step} of 4
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Cycle Setup
            </span>
          </div>
          <button
            onClick={handleFinish}
            className="text-xs text-stone-400 hover:text-stone-700 font-semibold"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Recent Period Date */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 id="onboarding-title" className="text-xl font-bold text-stone-900 tracking-tight">
                When did your most recent period start?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                The first day you noticed menstrual flow. If you aren't sure, select an approximate date—you can always update it later.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                First Day of Last Period
              </label>
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-white font-medium text-stone-900 focus:outline-rose-500"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Cycle & Period Length */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                How long are your cycle and period?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Most cycles range between 21 and 35 days, with flow lasting 3 to 7 days.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-700">Average Cycle Length</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {cycleLength} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>21d</span>
                  <span>28d (Standard)</span>
                  <span>45d</span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-700">Average Period Duration</span>
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
                  <span>5 days</span>
                  <span>10 days</span>
                </div>
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
                className="w-2/3 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Regularity */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Smile className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                How regular is your menstrual cycle?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                This helps NIVA calculate prediction confidence intervals for upcoming cycles.
              </p>
            </div>

            <div className="space-y-2">
              {(
                [
                  { id: 'Regular', label: 'Regular', desc: 'Starts within 1–2 days of prediction' },
                  { id: 'Somewhat Irregular', label: 'Somewhat Irregular', desc: 'Varies by a few days each month' },
                  { id: 'Irregular', label: 'Irregular', desc: 'Varies by more than a week or hard to predict' },
                  { id: 'Not sure', label: 'Not Sure', desc: 'First time tracking or postpartum/perimenopausal' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRegularity(opt.id)}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
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

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-2xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Frequent Symptoms & Confirmation */}
        {step === 4 && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Any recurring symptoms you notice?
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Select any that frequently occur. NIVA will monitor these for phase correlations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_SYMPTOMS_LIST.map((sym) => {
                const active = commonSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                      active
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-2xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All preferences are editable at any time in Profile Settings.</span>
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
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build My NIVA Calendar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
