import React, { useState, useEffect } from 'react';
import {
  X,
  Droplets,
  Smile,
  Heart,
  Check,
  Trash2,
  Moon,
  Activity,
  Bell,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { DailyLog, FlowLevel, MenstrualProduct, PadChangeRecord } from '../types';
import { formatDisplayDate } from '../utils/cycleCalculations';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  existingLog?: DailyLog;
  padCareEnabled?: boolean;
  onSaveLog: (log: DailyLog, promptPadCareReminder?: boolean) => void;
  onDeleteLog?: (dateStr: string) => void;
  onLogInstantPadChange?: () => void;
}

const FLOW_OPTIONS: { id: FlowLevel; label: string; desc: string }[] = [
  { id: 'None', label: 'No Flow', desc: 'No menstrual bleeding' },
  { id: 'Spotting', label: 'Spotting', desc: 'Light spotting or pink discharge' },
  { id: 'Light', label: 'Light', desc: 'Minimal flow' },
  { id: 'Medium', label: 'Medium', desc: 'Standard menstrual flow' },
  { id: 'Heavy', label: 'Heavy', desc: 'Heavier flow' },
];

const MENSTRUAL_PRODUCTS: { id: MenstrualProduct; label: string }[] = [
  { id: 'Pad', label: 'Menstrual Pad' },
  { id: 'Tampon', label: 'Tampon' },
  { id: 'Cup', label: 'Menstrual Cup' },
  { id: 'Period Underwear', label: 'Period Underwear' },
  { id: 'Other', label: 'Other' },
];

const MOOD_OPTIONS = [
  { id: 'Calm', emoji: '😌', label: 'Calm' },
  { id: 'Happy', emoji: '😊', label: 'Happy' },
  { id: 'Energetic', emoji: '⚡', label: 'Energetic' },
  { id: 'Neutral', emoji: '😐', label: 'Neutral' },
  { id: 'Stressed', emoji: '😰', label: 'Stressed' },
  { id: 'Irritated', emoji: '😤', label: 'Irritated' },
  { id: 'Tired', emoji: '😴', label: 'Tired' },
  { id: 'Sad', emoji: '🥺', label: 'Sad' },
];

const SYMPTOM_OPTIONS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Back Pain',
  'Breast Tenderness',
  'Acne',
  'Fatigue',
  'Cravings',
  'Nausea',
  'Insomnia',
  'Discharge Changes',
  'Mood Swings',
];

const DISCHARGE_OPTIONS = ['None', 'Dry', 'Sticky', 'Creamy', 'Egg-white', 'Watery'];

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  existingLog,
  padCareEnabled,
  onSaveLog,
  onDeleteLog,
  onLogInstantPadChange,
}) => {
  const [flow, setFlow] = useState<FlowLevel>('None');
  const [menstrualProduct, setMenstrualProduct] = useState<MenstrualProduct>('Pad');
  const [padChangesCount, setPadChangesCount] = useState<number>(0);
  const [lastPadChangeTime, setLastPadChangeTime] = useState<string | undefined>(undefined);
  const [padChangeHistory, setPadChangeHistory] = useState<PadChangeRecord[]>([]);
  const [crampsLevel, setCrampsLevel] = useState<number>(0);
  const [mood, setMood] = useState<string>('Calm');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [discharge, setDischarge] = useState<string>('None');
  const [notes, setNotes] = useState<string>('');
  const [waterGlasses, setWaterGlasses] = useState<number>(6);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [justLoggedChange, setJustLoggedChange] = useState<boolean>(false);

  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'None');
      setMenstrualProduct(existingLog.menstrualProduct || 'Pad');
      setPadChangesCount(existingLog.padChangesCount || 0);
      setLastPadChangeTime(existingLog.lastPadChangeTime);
      setPadChangeHistory(existingLog.padChangeHistory || []);
      setCrampsLevel(existingLog.crampsLevel ?? 0);
      setMood(existingLog.mood || 'Calm');
      setSymptoms(existingLog.symptoms || []);
      setDischarge(existingLog.discharge || 'None');
      setNotes(existingLog.notes || '');
      setWaterGlasses(existingLog.waterGlasses || 6);
      setSleepHours(existingLog.sleepHours || 7.5);
      setStressLevel(existingLog.stressLevel || 2);
      setEnergyLevel(existingLog.energyLevel || 3);
    } else {
      setFlow('None');
      setMenstrualProduct('Pad');
      setPadChangesCount(0);
      setLastPadChangeTime(undefined);
      setPadChangeHistory([]);
      setCrampsLevel(0);
      setMood('Calm');
      setSymptoms([]);
      setDischarge('None');
      setNotes('');
      setWaterGlasses(6);
      setSleepHours(7.5);
      setStressLevel(2);
      setEnergyLevel(3);
    }
    setJustLoggedChange(false);
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const handleSelectFlow = (f: FlowLevel) => {
    setFlow(f);
    if (f !== 'None' && !menstrualProduct) {
      setMenstrualProduct('Pad');
    }
  };

  const handleIncrementPadChange = () => {
    const nowIso = new Date().toISOString();
    setPadChangesCount((prev) => prev + 1);
    setLastPadChangeTime(nowIso);
    setPadChangeHistory((prev) => [
      ...prev,
      { id: `pc-${Date.now()}`, timestamp: nowIso },
    ]);
    setJustLoggedChange(true);
    if (onLogInstantPadChange) {
      onLogInstantPadChange();
    }
  };

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    const isPeriodStarted = flow !== 'None';
    const updated: DailyLog = {
      date: dateStr,
      flow,
      menstrualProduct: isPeriodStarted ? menstrualProduct : undefined,
      padChangesCount: menstrualProduct === 'Pad' ? padChangesCount : undefined,
      lastPadChangeTime: menstrualProduct === 'Pad' ? lastPadChangeTime : undefined,
      padChangeHistory: menstrualProduct === 'Pad' ? padChangeHistory : undefined,
      crampsLevel,
      mood,
      symptoms,
      discharge,
      notes,
      confirmedPeriod: isPeriodStarted,
      waterGlasses,
      sleepHours,
      sleepQuality: existingLog?.sleepQuality || 'Good',
      stressLevel,
      energyLevel,
      exerciseMinutes: existingLog?.exerciseMinutes || 20,
      exerciseType: existingLog?.exerciseType,
    };

    // Check if we should prompt for Pad Care Reminders:
    // Prompt when period has started AND user chose Pad AND reminders not enabled yet
    const shouldPromptPadCare =
      isPeriodStarted &&
      menstrualProduct === 'Pad' &&
      !padCareEnabled;

    onSaveLog(updated, shouldPromptPadCare);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-log-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
              Daily Record
            </span>
            <h3 id="daily-log-title" className="text-base font-bold text-stone-900">
              {formatDisplayDate(dateStr, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-stone-700">
          {/* Flow */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 flex items-center space-x-1.5">
              <Droplets className="w-3.5 h-3.5 text-rose-500" />
              <span>Menstrual Flow</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {FLOW_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFlow(f.id)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    flow === f.id
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/40 text-rose-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs block">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menstrual Product & Pad Care (Visible when period flow is active) */}
          {flow !== 'None' && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Menstrual Product Used</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    Select primary product
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MENSTRUAL_PRODUCTS.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setMenstrualProduct(prod.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        menstrualProduct === prod.id
                          ? 'bg-white border-rose-300 ring-2 ring-rose-400/40 text-rose-900 font-bold shadow-xs'
                          : 'bg-stone-50/70 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-xs block">{prod.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedicated Pad Usage Tracking when Pad is selected */}
              {menstrualProduct === 'Pad' && (
                <div className="pt-2 border-t border-rose-100/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-800 text-xs block">
                        Pad Changes Today
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {lastPadChangeTime
                          ? `Last changed: ${new Date(lastPadChangeTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'No pad changes recorded yet today'}
                      </span>
                    </div>

                    {/* Counter controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPadChangesCount((prev) => Math.max(0, prev - 1))
                        }
                        className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 flex items-center justify-center hover:bg-stone-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-stone-900 text-sm w-6 text-center">
                        {padChangesCount}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrementPadChange}
                        className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleIncrementPadChange}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-rose-600" />
                      <span>Log Pad Change Right Now</span>
                    </button>

                    {justLoggedChange && (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Logged!</span>
                      </span>
                    )}
                  </div>

                  {padCareEnabled ? (
                    <p className="text-[10px] text-rose-800/80 leading-snug flex items-center space-x-1">
                      <Bell className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>
                        Pad Care Reminders active. Logging a change automatically resets your reminder timer.
                      </span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-stone-500 leading-snug flex items-center space-x-1">
                      <Bell className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>
                        NIVA will offer optional smart reminders after saving so you can stay comfortably fresh.
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cramps Level */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-stone-800">
                Cramp / Pain Severity (0 to 5)
              </label>
              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {crampsLevel === 0 ? 'None' : `${crampsLevel}/5`}
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
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 flex items-center space-x-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Mood State</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    mood === m.id
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 text-amber-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base block mb-0.5">{m.emoji}</span>
                  <span className="text-[11px] block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Physical Symptoms</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SYMPTOM_OPTIONS.map((sym) => {
                const active = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`p-2 rounded-xl border text-center transition-all text-xs ${
                      active
                        ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cervical Mucus / Discharge */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800">Cervical Fluid / Discharge</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {DISCHARGE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDischarge(d)}
                  className={`p-1.5 rounded-lg border text-center text-xs transition-all ${
                    discharge === d
                      ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-800 block">Personal Journal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes or observations for this day..."
              className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          {existingLog && onDeleteLog ? (
            <button
              onClick={() => {
                onDeleteLog(dateStr);
                onClose();
              }}
              className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 font-semibold text-xs py-1.5 px-2.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entry</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
            >
              Save Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
