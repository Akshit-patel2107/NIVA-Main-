import React, { useState } from 'react';
import {
  Activity,
  Droplets,
  Heart,
  Moon,
  Sparkles,
  TrendingUp,
  Smile,
  AlertCircle,
  Plus,
  Minus,
  Check,
  Calendar,
  Save,
} from 'lucide-react';
import { DailyLog, FlowLevel, UserPreferences } from '../types';
import { formatDate, formatDisplayDate } from '../utils/cycleCalculations';

interface TrackViewProps {
  logs: Record<string, DailyLog>;
  onSaveLog: (log: DailyLog) => void;
  preferences: UserPreferences;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const SYMPTOM_OPTIONS = [
  { id: 'Cramps', label: 'Pelvic Cramps', icon: '⚡' },
  { id: 'Headache', label: 'Headache', icon: '🤕' },
  { id: 'Bloating', label: 'Bloating', icon: '🎈' },
  { id: 'Fatigue', label: 'Fatigue / Low Energy', icon: '🥱' },
  { id: 'Back Pain', label: 'Lower Back Pain', icon: '🩹' },
  { id: 'Breast Tenderness', label: 'Breast Tenderness', icon: '🌸' },
  { id: 'Acne', label: 'Acne / Breakouts', icon: '✨' },
  { id: 'Nausea', label: 'Nausea', icon: '🤢' },
  { id: 'Cravings', label: 'Food Cravings', icon: '🍫' },
  { id: 'Discharge Changes', label: 'Cervical Mucus Shift', icon: '💧' },
  { id: 'Mood Swings', label: 'Mood Swings', icon: '🎭' },
  { id: 'Insomnia', label: 'Restless Sleep / Insomnia', icon: '🌙' },
];

const MOOD_OPTIONS = [
  { id: 'Happy', label: 'Happy & Uplifted', emoji: '😊', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { id: 'Calm', label: 'Calm & Grounded', emoji: '😌', color: 'bg-teal-50 border-teal-200 text-teal-800' },
  { id: 'Energetic', label: 'Energetic & Focused', emoji: '⚡', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { id: 'Neutral', label: 'Balanced / Neutral', emoji: '😐', color: 'bg-stone-50 border-stone-200 text-stone-700' },
  { id: 'Stressed', label: 'Stressed / Overwhelmed', emoji: '😰', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { id: 'Irritated', label: 'Irritated / Sensitive', emoji: '😤', color: 'bg-rose-50 border-rose-200 text-rose-800' },
  { id: 'Tired', label: 'Exhausted / Sluggish', emoji: '🥱', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { id: 'Sad', label: 'Sad / Low Mood', emoji: '🥺', color: 'bg-blue-50 border-blue-200 text-blue-800' },
];

const FLOW_LEVELS: { id: FlowLevel; label: string; desc: string }[] = [
  { id: 'None', label: 'No Flow', desc: 'No period blood' },
  { id: 'Spotting', label: 'Spotting', desc: 'A few drops or pink/brown discharge' },
  { id: 'Light', label: 'Light Flow', desc: 'Minimal bleeding, light protection' },
  { id: 'Medium', label: 'Medium Flow', desc: 'Regular moderate menstrual flow' },
  { id: 'Heavy', label: 'Heavy Flow', desc: 'Heavier flow, frequent changing' },
];

export const TrackView: React.FC<TrackViewProps> = ({
  logs,
  onSaveLog,
  preferences,
  selectedDate,
  onSelectDate,
}) => {
  const currentLog: DailyLog = logs[selectedDate] || {
    date: selectedDate,
    flow: 'None',
    crampsLevel: 0,
    mood: 'Calm',
    symptoms: [],
    discharge: 'None',
    notes: '',
    confirmedPeriod: false,
    waterGlasses: 6,
    sleepHours: 7.5,
    sleepQuality: 'Good',
    stressLevel: 2,
    energyLevel: 3,
    exerciseMinutes: 20,
    exerciseType: 'Walking',
  };

  const [flow, setFlow] = useState<FlowLevel>(currentLog.flow);
  const [crampsLevel, setCrampsLevel] = useState<number>(currentLog.crampsLevel);
  const [mood, setMood] = useState<string>(currentLog.mood);
  const [symptoms, setSymptoms] = useState<string[]>(currentLog.symptoms || []);
  const [discharge, setDischarge] = useState<string>(currentLog.discharge || 'None');
  const [notes, setNotes] = useState<string>(currentLog.notes || '');
  const [waterGlasses, setWaterGlasses] = useState<number>(currentLog.waterGlasses || 6);
  const [sleepHours, setSleepHours] = useState<number>(currentLog.sleepHours || 7.5);
  const [sleepQuality, setSleepQuality] = useState<'Poor' | 'Fair' | 'Good' | 'Deep'>(
    currentLog.sleepQuality || 'Good'
  );
  const [stressLevel, setStressLevel] = useState<number>(currentLog.stressLevel || 2);
  const [energyLevel, setEnergyLevel] = useState<number>(currentLog.energyLevel || 3);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(currentLog.exerciseMinutes || 20);
  const [exerciseType, setExerciseType] = useState<string>(currentLog.exerciseType || 'Walking');
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Sync state when selectedDate changes
  React.useEffect(() => {
    const l = logs[selectedDate];
    if (l) {
      setFlow(l.flow);
      setCrampsLevel(l.crampsLevel);
      setMood(l.mood);
      setSymptoms(l.symptoms || []);
      setDischarge(l.discharge || 'None');
      setNotes(l.notes || '');
      setWaterGlasses(l.waterGlasses || 6);
      setSleepHours(l.sleepHours || 7.5);
      setSleepQuality(l.sleepQuality || 'Good');
      setStressLevel(l.stressLevel || 2);
      setEnergyLevel(l.energyLevel || 3);
      setExerciseMinutes(l.exerciseMinutes || 20);
      setExerciseType(l.exerciseType || 'Walking');
    } else {
      setFlow('None');
      setCrampsLevel(0);
      setMood('Calm');
      setSymptoms([]);
      setDischarge('None');
      setNotes('');
      setWaterGlasses(6);
      setSleepHours(7.5);
      setSleepQuality('Good');
      setStressLevel(2);
      setEnergyLevel(3);
      setExerciseMinutes(20);
      setExerciseType('Walking');
    }
  }, [selectedDate, logs]);

  const toggleSymptom = (symId: string) => {
    setSymptoms((prev) =>
      prev.includes(symId) ? prev.filter((s) => s !== symId) : [...prev, symId]
    );
  };

  const handleSave = () => {
    const updated: DailyLog = {
      date: selectedDate,
      flow,
      crampsLevel,
      mood,
      symptoms,
      discharge,
      notes,
      confirmedPeriod: flow !== 'None',
      waterGlasses,
      sleepHours,
      sleepQuality,
      stressLevel,
      energyLevel,
      exerciseMinutes,
      exerciseType,
    };
    onSaveLog(updated);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  // Historical calculation for symptom frequency chart
  const symptomFrequency: Record<string, number> = {};
  const moodFrequency: Record<string, number> = {};
  Object.values(logs).forEach((log) => {
    if (log.symptoms) {
      log.symptoms.forEach((s) => {
        symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
      });
    }
    if (log.mood) {
      moodFrequency[log.mood] = (moodFrequency[log.mood] || 0) + 1;
    }
  });

  const sortedSymptoms = Object.entries(symptomFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
            Daily Symptom & Wellness Journal
          </span>
          <h2 className="text-xl font-bold text-stone-900">
            Logging for {formatDisplayDate(selectedDate, { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Your entries help NIVA discover recurring hormonal patterns and personalize insights.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="text-xs border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 text-stone-700 font-medium focus:outline-rose-500"
          />

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Log</span>
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Daily wellness record saved successfully! Cycle predictions have updated.</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flow & Symptoms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Period & Flow Intensity */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>Menstrual Flow</span>
              </h3>
              <span className="text-xs font-medium text-stone-400">
                {flow === 'None' ? 'Non-period day' : 'Active Flow'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FLOW_LEVELS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFlow(f.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    flow === f.id
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40 text-rose-950 font-semibold shadow-xs'
                      : 'bg-stone-50/70 border-stone-200/70 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs font-bold block">{f.label}</span>
                  <span className="text-[10px] text-stone-500 block leading-tight mt-0.5 line-clamp-2">
                    {f.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Cramps Level Slider */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700">Pelvic Cramp / Pain Intensity:</span>
                <span className="font-bold text-rose-600 px-2 py-0.5 bg-rose-50 rounded-md">
                  {crampsLevel === 0 ? '0 - None' : `${crampsLevel} / 5`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={crampsLevel}
                onChange={(e) => setCrampsLevel(Number(e.target.value))}
                className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                <span>None</span>
                <span>Mild</span>
                <span>Moderate</span>
                <span>Significant</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Section: Symptoms Multi-select */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Physical Symptoms Today</span>
              </h3>
              <span className="text-xs text-stone-400">
                {symptoms.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const active = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      active
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold shadow-2xs'
                        : 'bg-stone-50/60 border-stone-200 text-stone-600 hover:bg-stone-100/70'
                    }`}
                  >
                    <span className="text-base">{sym.icon}</span>
                    <span className="text-xs truncate">{sym.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Mood Selection */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Emotional State & Mood</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const active = mood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      active
                        ? `${m.color} ring-2 ring-offset-1 font-bold shadow-xs`
                        : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-xl block mb-1">{m.emoji}</span>
                    <span className="text-xs block leading-tight">{m.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Personal Notes */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-2">
            <label className="text-sm font-bold text-stone-900 block">
              Personal Notes & Reflections
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild headache mid-afternoon, drinking chamomile tea, had a peaceful walk in the park..."
              className="w-full text-xs p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-700 placeholder:text-stone-400 focus:outline-rose-500"
            />
          </div>
        </div>

        {/* Right Column: Daily Wellness Tracking & Insights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Wellness: Hydration */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <span className="text-base">💧</span>
                <span>Water Hydration</span>
              </h3>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {(waterGlasses * 0.25).toFixed(1)} Liters
              </span>
            </div>

            <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <button
                onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                aria-label="Decrease water"
                className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="text-3xl font-black text-stone-900">
                  {waterGlasses}
                </span>
                <span className="text-xs text-stone-500 block">
                  of 8 recommended glasses (250ml)
                </span>
              </div>

              <button
                onClick={() => setWaterGlasses((prev) => prev + 1)}
                aria-label="Increase water"
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Visual water glass dots */}
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-7 rounded-md transition-all ${
                    i < waterGlasses
                      ? 'bg-blue-500 border border-blue-600 shadow-2xs'
                      : 'bg-stone-100 border border-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Wellness: Sleep Tracking */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Rest & Sleep</span>
              </h3>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                {sleepHours} Hours
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>4 hrs</span>
                <span>8 hrs</span>
                <span>12 hrs</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['Poor', 'Fair', 'Good', 'Deep'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepQuality(q)}
                  className={`py-1.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    sleepQuality === q
                      ? 'bg-indigo-600 text-white font-bold border-indigo-700 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Wellness: Energy & Stress Sliders */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Energy & Stress Scales</span>
            </h3>

            {/* Energy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-stone-600">Vitality & Energy:</span>
                <span className="font-bold text-amber-600">{energyLevel} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Exhausted</span>
                <span>Peak Vitality</span>
              </div>
            </div>

            {/* Stress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-stone-600">Perceived Stress:</span>
                <span className="font-bold text-orange-600">{stressLevel} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Deeply Relaxed</span>
                <span>High Stress</span>
              </div>
            </div>
          </div>

          {/* Recurring Symptom Patterns Snapshot */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200/80 space-y-3">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
              <span>Recurring Patterns Across Logs</span>
            </h4>

            {sortedSymptoms.length > 0 ? (
              <div className="space-y-2">
                {sortedSymptoms.map(([sym, count]) => (
                  <div key={sym} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-700">
                      <span className="font-medium">{sym}</span>
                      <span className="text-stone-400">{count} times</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (count / Object.keys(logs).length) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">
                Log a few more days to visualize your recurring symptom trends here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
