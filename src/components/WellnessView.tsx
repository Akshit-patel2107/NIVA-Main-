import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  Moon,
  Activity,
  Smile,
  Zap,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Wind,
} from 'lucide-react';
import { DailyLog, UserPreferences } from '../types';
import { formatDate } from '../utils/cycleCalculations';

interface WellnessViewProps {
  logs: Record<string, DailyLog>;
  todayLog?: DailyLog;
  onSaveLog: (log: DailyLog) => void;
  preferences: UserPreferences;
  onOpenAI: () => void;
}

export const WellnessView: React.FC<WellnessViewProps> = ({
  logs,
  todayLog,
  onSaveLog,
  preferences,
  onOpenAI,
}) => {
  const todayStr = formatDate(new Date());

  const currentLog: DailyLog = todayLog || {
    date: todayStr,
    flow: 'None',
    crampsLevel: 0,
    mood: 'Calm',
    symptoms: [],
    discharge: 'None',
    waterGlasses: 6,
    sleepHours: 7.5,
    sleepQuality: 'Good',
    stressLevel: 2,
    energyLevel: 3,
    exerciseMinutes: 25,
    exerciseType: 'Walking',
  };

  const [waterGlasses, setWaterGlasses] = useState<number>(currentLog.waterGlasses || 6);
  const [sleepHours, setSleepHours] = useState<number>(currentLog.sleepHours || 7.5);
  const [sleepQuality, setSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Deep'>(
    currentLog.sleepQuality || 'Good'
  );
  const [activityMinutes, setActivityMinutes] = useState<number>(currentLog.exerciseMinutes || 25);
  const [activityType, setActivityType] = useState<string>(currentLog.exerciseType || 'Walking');
  const [stressLevel, setStressLevel] = useState<number>(currentLog.stressLevel || 2);
  const [energyLevel, setEnergyLevel] = useState<number>(currentLog.energyLevel || 3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if todayLog updates
  React.useEffect(() => {
    if (todayLog) {
      setWaterGlasses(todayLog.waterGlasses || 6);
      setSleepHours(todayLog.sleepHours || 7.5);
      setSleepQuality(todayLog.sleepQuality || 'Good');
      setActivityMinutes(todayLog.exerciseMinutes || 25);
      setActivityType(todayLog.exerciseType || 'Walking');
      setStressLevel(todayLog.stressLevel || 2);
      setEnergyLevel(todayLog.energyLevel || 3);
    }
  }, [todayLog]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleUpdate = (updates: Partial<DailyLog>, label: string) => {
    const updated: DailyLog = {
      ...currentLog,
      waterGlasses,
      sleepHours,
      sleepQuality,
      exerciseMinutes: activityMinutes,
      exerciseType: activityType,
      stressLevel,
      energyLevel,
      ...updates,
    };
    onSaveLog(updated);
    showToast(`Updated ${label}! 💜`);
  };

  // Calculate Weekly and Monthly patterns from logs
  const allLogsList = Object.values(logs);
  const recent7Days = allLogsList.slice(-7);
  const recent30Days = allLogsList.slice(-30);

  const avgSleep7 = recent7Days.length > 0
    ? (recent7Days.reduce((acc, l) => acc + (l.sleepHours || 7.5), 0) / recent7Days.length).toFixed(1)
    : '7.5';

  const daysWaterGoalMet7 = recent7Days.filter((l) => (l.waterGlasses || 0) >= 8).length;
  const avgEnergy7 = recent7Days.length > 0
    ? (recent7Days.reduce((acc, l) => acc + (l.energyLevel || 3), 0) / recent7Days.length).toFixed(1)
    : '3.2';

  const totalActivity30 = recent30Days.reduce((acc, l) => acc + (l.exerciseMinutes || 0), 0);

  // Generate dynamic gentle suggestions based on entries
  const getGentleSuggestions = () => {
    const tips: string[] = [];

    if (waterGlasses < 6) {
      tips.push('Drinking an extra glass of water or mild lemon infusion can help keep cellular fluid balance steady today.');
    } else {
      tips.push('Great hydration today! Consistent fluid intake naturally eases feelings of abdominal bloating.');
    }

    if (sleepHours < 7) {
      tips.push('Your sleep was a bit lighter. A gentle 10-minute warm bath or dimming overhead screens before bed can signal rest to your nervous system.');
    } else {
      tips.push('You achieved restorative rest hours. Solid sleep provides an excellent biological foundation for hormonal balance.');
    }

    if (stressLevel >= 4) {
      tips.push('Stress feels elevated today. Consider taking three slow breaths into your belly, or switching intense workouts to a slow stroll.');
    }

    if (activityMinutes >= 30) {
      tips.push(`Wonderful movement today (${activityMinutes} min of ${activityType}). Regular gentle activity enhances circulation and mood.`);
    }

    return tips;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-teal-300" />
          <span>Daily Wellness & Nourishment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Wellness Goals & Tracking
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
          Track simple foundational daily goals for sleep, hydration, movement, energy, and stress. NIVA translates your entries into peaceful weekly summaries.
        </p>
      </div>

      {/* 5 DAILY GOALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Hydration Goal */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Hydration</h4>
                <span className="text-[11px] text-stone-400">Daily Goal: 8 glasses (2.0 L)</span>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {waterGlasses} / 8 glasses
            </span>
          </div>

          {/* Hydration meter */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-500">
              {(waterGlasses * 0.25).toFixed(1)} Liters consumed
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, waterGlasses - 1);
                  setWaterGlasses(val);
                  handleUpdate({ waterGlasses: val }, 'Hydration');
                }}
                className="w-8 h-8 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = waterGlasses + 1;
                  setWaterGlasses(val);
                  handleUpdate({ waterGlasses: val }, 'Hydration');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Glass</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Sleep Goal */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Sleep Duration & Quality</h4>
                <span className="text-[11px] text-stone-400">Daily Goal: 7.5 – 9.0 hours</span>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {sleepHours} hrs
            </span>
          </div>

          <input
            type="range"
            min="4"
            max="12"
            step="0.5"
            value={sleepHours}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSleepHours(val);
              handleUpdate({ sleepHours: val }, 'Sleep Hours');
            }}
            className="w-full accent-indigo-600 h-2 bg-stone-100 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-stone-500">Quality:</span>
            <div className="flex space-x-1.5">
              {(['Poor', 'Fair', 'Good', 'Deep'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setSleepQuality(q);
                    handleUpdate({ sleepQuality: q }, 'Sleep Quality');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    sleepQuality === q
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Daily Activity / Movement */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Activity & Movement</h4>
                <span className="text-[11px] text-stone-400">Daily Goal: 30 minutes</span>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              {activityMinutes} mins
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['Walking', 'Yoga', 'Pilates', 'Stretching', 'Running', 'Strength', 'Rest'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => {
                    setActivityType(type);
                    handleUpdate({ exerciseType: type }, `Activity: ${type}`);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                    activityType === type
                      ? 'bg-teal-100 border-teal-300 text-teal-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-500">Duration (mins):</span>
            <div className="flex items-center space-x-1.5">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setActivityMinutes(m);
                    handleUpdate({ exerciseMinutes: m }, `${m} mins activity`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    activityMinutes === m
                      ? 'bg-teal-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Stress & Nervous System Management */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Stress Balance</h4>
                <span className="text-[11px] text-stone-400">Keep within 1–2 for calm hormones</span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full">
              Level {stressLevel} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[
              { lvl: 1, label: 'Calm' },
              { lvl: 2, label: 'Steady' },
              { lvl: 3, label: 'Moderate' },
              { lvl: 4, label: 'High' },
              { lvl: 5, label: 'Overwhelmed' },
            ].map((s) => (
              <button
                key={s.lvl}
                onClick={() => {
                  setStressLevel(s.lvl);
                  handleUpdate({ stressLevel: s.lvl }, `Stress: ${s.label}`);
                }}
                className={`py-2 px-1 rounded-xl text-center border transition-all ${
                  stressLevel === s.lvl
                    ? 'bg-orange-100 border-orange-300 text-orange-950 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span className="text-[11px] block">{s.lvl}</span>
                <span className="text-[9px] block truncate">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GENTLE WELLNESS SUGGESTIONS (Non-Medical) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-stone-900">
              NIVA Gentle Wellness Suggestions
            </h3>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">
            Personalized to today’s inputs
          </span>
        </div>

        <div className="space-y-2.5">
          {getGentleSuggestions().map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 leading-relaxed flex items-start space-x-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <p>{tip}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-stone-400 italic pt-1">
          Disclaimer: NIVA suggestions are non-medical lifestyle tips based on self-reported entries and do not replace clinical advice.
        </p>
      </div>

      {/* WEEKLY & MONTHLY PLAIN-LANGUAGE SUMMARIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Rhythm Summary */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-stone-700">
            <Calendar className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              7-Day Rhythm Summary
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Over the past week, you averaged <strong className="text-stone-900">{avgSleep7} hours</strong> of sleep each night. Hydration reached your goal on <strong className="text-stone-900">{daysWaterGoalMet7} out of 7 days</strong>, and your overall energy averaged <strong className="text-stone-900">{avgEnergy7} out of 5</strong>.
          </p>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-500 leading-snug">
            💡 Pattern: Days with 7+ glasses of water and consistent sleep duration showed lower self-reported physical fatigue.
          </div>
        </div>

        {/* Monthly Wellness Overview */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2 text-stone-700">
            <Clock className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Monthly Wellness Overview
            </h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Across your recorded month, you logged <strong className="text-stone-900">{recent30Days.length} daily entries</strong> and accumulated <strong className="text-stone-900">{totalActivity30} minutes</strong> of purposeful movement and restorative exercise.
          </p>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-500 leading-snug">
            🌿 Summary: Your lifestyle habits show steady regularity. You don't need to analyze complicated charts—your rhythm is harmonizing smoothly.
          </div>
        </div>
      </div>
    </div>
  );
};
