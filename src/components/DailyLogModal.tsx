import React, { useState, useEffect } from 'react';
import { X, Droplets, Smile, Heart, Check, Trash2, Moon, Activity } from 'lucide-react';
import { DailyLog, FlowLevel } from '../types';
import { formatDisplayDate } from '../utils/cycleCalculations';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  existingLog?: DailyLog;
  onSaveLog: (log: DailyLog) => void;
  onDeleteLog?: (dateStr: string) => void;
}

const FLOW_OPTIONS: { id: FlowLevel; label: string; desc: string }[] = [
  { id: 'None', label: 'No Flow', desc: 'No menstrual bleeding' },
  { id: 'Spotting', label: 'Spotting', desc: 'Light spotting or pink discharge' },
  { id: 'Light', label: 'Light', desc: 'Minimal flow' },
  { id: 'Medium', label: 'Medium', desc: 'Standard menstrual flow' },
  { id: 'Heavy', label: 'Heavy', desc: 'Heavier flow' },
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
  onSaveLog,
  onDeleteLog,
}) => {
  const [flow, setFlow] = useState<FlowLevel>('None');
  const [crampsLevel, setCrampsLevel] = useState<number>(0);
  const [mood, setMood] = useState<string>('Calm');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [discharge, setDischarge] = useState<string>('None');
  const [notes, setNotes] = useState<string>('');
  const [waterGlasses, setWaterGlasses] = useState<number>(6);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [stressLevel, setStressLevel] = useState<number>(2);
  const [energyLevel, setEnergyLevel] = useState<number>(3);

  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow || 'None');
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
  }, [existingLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSave = () => {
    const updated: DailyLog = {
      date: dateStr,
      flow,
      crampsLevel,
      mood,
      symptoms,
      discharge,
      notes,
      confirmedPeriod: flow !== 'None',
      waterGlasses,
      sleepHours,
      sleepQuality: existingLog?.sleepQuality || 'Good',
      stressLevel,
      energyLevel,
      exerciseMinutes: existingLog?.exerciseMinutes || 20,
      exerciseType: existingLog?.exerciseType,
    };
    onSaveLog(updated);
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
                  onClick={() => setFlow(f.id)}
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
