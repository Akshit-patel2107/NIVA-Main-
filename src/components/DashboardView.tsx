import React, { useState } from 'react';
import {
  Calendar,
  Activity,
  Heart,
  Droplet,
  Sparkles,
  PlusCircle,
  Clock,
  Smile,
  Zap,
  Moon,
  ChevronRight,
  Check,
  CheckCircle2,
  Info,
  Bell,
} from 'lucide-react';
import {
  CycleStatus,
  formatDisplayDate,
  getPhaseColor,
  getPhaseInfo,
} from '../utils/cycleCalculations';
import {
  CycleStats,
  DailyLog,
  NavigationTab,
  UserAccount,
  UserPreferences,
} from '../types';

interface DashboardViewProps {
  status: CycleStatus;
  stats: CycleStats;
  todayLog?: DailyLog;
  account: UserAccount;
  preferences: UserPreferences;
  onOpenLogModal: (dateStr?: string) => void;
  onOpenAI: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onUpdateDailyLog: (log: DailyLog) => void;
  onLogPadChange?: () => void;
  onOpenPadPrompt?: () => void;
  onOpenNotifications?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  stats,
  todayLog,
  account,
  preferences,
  onOpenLogModal,
  onOpenAI,
  onNavigateTab,
  onUpdateDailyLog,
  onLogPadChange,
  onOpenPadPrompt,
  onOpenNotifications,
}) => {
  const phaseColors = getPhaseColor(status.currentPhase);
  const phaseInfo = getPhaseInfo(status.currentPhase);
  const isDiscreet = preferences.discreetMode;

  const [checkinSavedToast, setCheckinSavedToast] = useState<string | null>(null);

  // SVG Circular progress math for the main cycle dial
  const radius = 100;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progressPercent = Math.min(1, Math.max(0.01, status.cycleDay / stats.averageCycleLength));
  const strokeDashoffset = circumference - progressPercent * circumference;

  const triggerToast = (msg: string) => {
    setCheckinSavedToast(msg);
    setTimeout(() => {
      setCheckinSavedToast(null);
    }, 2400);
  };

  const handleUpdateCheckin = (updates: Partial<DailyLog>, label: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: DailyLog = {
      ...(todayLog || {
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
        exerciseMinutes: 20,
      }),
      ...updates,
    };
    onUpdateDailyLog(updated);
    triggerToast(`Logged ${label}! 💜`);
  };

  const userName = account.name ? account.name.split(' ')[0] : 'there';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      {/* Toast notification for fast check-in */}
      {checkinSavedToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{checkinSavedToast}</span>
        </div>
      )}

      {/* Gentle, Calm Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 p-4 sm:p-5 rounded-3xl border border-stone-200/70 shadow-2xs">
        <div>
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-serif-accent mt-0.5">
            Welcome, {userName} 💜
          </h1>
          <p className="text-xs text-stone-500">
            {isDiscreet
              ? 'Your cycle baseline is steady today.'
              : `You are in your ${status.currentPhase} phase. ${phaseInfo.tagline}.`}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <button
            onClick={() => onOpenLogModal()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>Quick Log</span>
          </button>
        </div>
      </div>

      {/* MAIN CARD: "Your Cycle" with visual cycle-progress indicator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs relative overflow-hidden">
        {/* Soft atmospheric gradient glow behind dial */}
        <div
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: phaseColors.bg }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: phaseColors.soft }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Column: Title, Day & Estimated Next Period */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: phaseColors.primary }}
              />
              <span>Your Cycle</span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                Current Cycle Day
              </span>
              <div className="flex items-baseline justify-center md:justify-start space-x-3">
                <span className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight font-serif-accent">
                  Day {status.cycleDay}
                </span>
                <span className="text-sm font-medium text-stone-400">
                  of {stats.averageCycleLength} days
                </span>
              </div>
            </div>

            {/* Estimated Next Period Date */}
            <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/60 space-y-1">
              <div className="flex items-center justify-center md:justify-start space-x-1.5 text-xs text-stone-500">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-semibold">Estimated Next Period:</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-stone-800">
                {isDiscreet
                  ? `In ~${status.daysUntilNextPeriod} days`
                  : formatDisplayDate(status.nextPeriodDate)}
                <span className="text-xs font-normal text-stone-500 ml-2">
                  ({status.daysUntilNextPeriod === 0
                    ? 'Predicted today'
                    : `approx. in ${status.daysUntilNextPeriod} days`})
                </span>
              </p>
              <p className="text-[11px] text-stone-400 leading-snug">
                Based on your {stats.averageCycleLength}-day cycle baseline (estimate, not a guarantee).
              </p>
            </div>
          </div>

          {/* Right Column: Visual Cycle-Progress Indicator (Circular Dial) */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
              >
                {/* Background track */}
                <circle
                  stroke="#F5ECE9"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress arc */}
                <circle
                  stroke={phaseColors.primary}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{
                    strokeDashoffset,
                    transition: 'stroke-dashoffset 1s ease-in-out',
                    strokeLinecap: 'round',
                  }}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>

              {/* Center text inside circular indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full mb-1 border"
                  style={{
                    backgroundColor: phaseColors.bg,
                    borderColor: phaseColors.border,
                    color: phaseColors.text,
                  }}
                >
                  {isDiscreet ? 'Current Rhythm' : status.currentPhase}
                </span>
                <span className="text-3xl font-black text-stone-900 tracking-tight">
                  Day {status.cycleDay}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {Math.round(progressPercent * 100)}% through cycle
                </span>
              </div>
            </div>

            <span className="text-[11px] text-stone-400 mt-2 font-medium">
              Visual cycle progress indicator
            </span>
          </div>
        </div>
      </div>

      {/* PAD CARE STATUS CARD (Visible during active period or when Pad Care is enabled) */}
      {((todayLog?.flow && todayLog.flow !== 'None') || status.currentPhase === 'Menstrual' || preferences.notifications.padCare?.enabled) && (
        <div className="bg-gradient-to-r from-rose-50/80 via-white to-purple-50/80 rounded-3xl p-4 sm:p-5 border border-rose-200/80 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-stone-900">
                    Pad Care & Hygiene Assistant
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.2 rounded-full">
                    {preferences.notifications.padCare?.enabled ? 'Active' : 'Optional'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  {todayLog?.padChangesCount
                    ? `Changed ${todayLog.padChangesCount} time${todayLog.padChangesCount > 1 ? 's' : ''} today`
                    : 'No pad changes recorded today'}{' '}
                  {todayLog?.lastPadChangeTime && (
                    <>
                      • Last at{' '}
                      <strong className="text-stone-700">
                        {new Date(todayLog.lastPadChangeTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {onLogPadChange && (
                <button
                  onClick={() => {
                    onLogPadChange();
                    triggerToast('Logged pad change! Timer reset 💜');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>+ Changed Pad</span>
                </button>
              )}

              {!preferences.notifications.padCare?.enabled && onOpenPadPrompt && (
                <button
                  onClick={onOpenPadPrompt}
                  className="px-3 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors"
                >
                  Enable Reminders
                </button>
              )}

              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  title="Notification Center"
                  className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTIONS ROW: Log Period, Log Symptoms, Log Mood, Track Wellness, Calendar, Ask NIVA AI */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Action 1: Log Period */}
          <button
            onClick={() => onOpenLogModal()}
            className="bg-white hover:bg-rose-50/60 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-rose-500/20" />
            </div>
            <span className="text-xs font-bold text-stone-800">Log Period</span>
            <span className="text-[10px] text-stone-400">Flow & spotting</span>
          </button>

          {/* Action 2: Log Symptoms */}
          <button
            onClick={() => onNavigateTab('track')}
            className="bg-white hover:bg-teal-50/60 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800">Log Symptoms</span>
            <span className="text-[10px] text-stone-400">Cramps, headache</span>
          </button>

          {/* Action 3: Log Mood */}
          <button
            onClick={() => onNavigateTab('track')}
            className="bg-white hover:bg-purple-50/60 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Smile className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800">Log Mood</span>
            <span className="text-[10px] text-stone-400">Emotions & feelings</span>
          </button>

          {/* Action 4: Track Wellness */}
          <button
            onClick={() => onNavigateTab('wellness')}
            className="bg-white hover:bg-blue-50/60 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-stone-800">Track Wellness</span>
            <span className="text-[10px] text-stone-400">Sleep & water</span>
          </button>

          {/* Action 5: Calendar */}
          <button
            onClick={() => onNavigateTab('calendar')}
            className="bg-white hover:bg-amber-50/60 p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800">Calendar</span>
            <span className="text-[10px] text-stone-400">Monthly estimates</span>
          </button>

          {/* Action 6: Ask NIVA AI */}
          <button
            onClick={onOpenAI}
            className="bg-gradient-to-br from-stone-900 to-rose-950 text-white p-3.5 rounded-2xl shadow-xs flex flex-col items-center text-center space-y-1.5 transition-all hover:scale-[1.02] group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white">Ask NIVA AI</span>
            <span className="text-[10px] text-stone-300">Cycle answers</span>
          </button>
        </div>
      </div>

      {/* TODAY'S CHECK-IN: How she feels today (Mood, Energy, Pain, Overall Wellbeing) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Today’s Check-in — How do you feel today?
              </h3>
              <p className="text-[11px] text-stone-500">
                Tap to record in one second. Keeps your cycle journal personalized.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Mood Check-in */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-600 block">
            Mood:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Happy', label: 'Happy 😊' },
              { id: 'Calm', label: 'Calm 😌' },
              { id: 'Neutral', label: 'Neutral 😐' },
              { id: 'Low', label: 'Low 😔' },
              { id: 'Irritable', label: 'Irritable 😤' },
              { id: 'Stressed', label: 'Stressed 😰' },
            ].map((m) => {
              const active = todayLog?.mood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleUpdateCheckin({ mood: m.id }, `Mood: ${m.id}`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Energy Check-in */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-600 block">
            Energy Level:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 5, label: 'High / Vibrant ⚡' },
              { val: 3, label: 'Moderate 🔋' },
              { val: 1, label: 'Low / Tired 🪫' },
            ].map((lvl) => {
              const active = todayLog?.energyLevel === lvl.val;
              return (
                <button
                  key={lvl.val}
                  onClick={() => handleUpdateCheckin({ energyLevel: lvl.val }, `Energy`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Pain / Cramps Check-in */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-600 block">
            Physical Discomfort / Pain:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 0, label: 'No Pain ✨' },
              { val: 1, label: 'Mild Cramps 🌸' },
              { val: 3, label: 'Moderate Cramps ⚡' },
              { val: 5, label: 'Severe Pain ⚠️' },
            ].map((p) => {
              const active = todayLog?.crampsLevel === p.val;
              return (
                <button
                  key={p.val}
                  onClick={() => handleUpdateCheckin({ crampsLevel: p.val }, `Pain Level`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-rose-100 border-rose-300 text-rose-900 font-bold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Overall Wellbeing Check-in */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-600 block">
            Overall Wellbeing Today:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Great', label: 'Great 🌿' },
              { id: 'Good', label: 'Good 🌸' },
              { id: 'Okay', label: 'Okay 🍂' },
              { id: 'Difficult', label: 'Tough Day 🌧️' },
            ].map((w) => {
              const active = todayLog?.overallWellbeing === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() =>
                    handleUpdateCheckin(
                      { overallWellbeing: w.id as any },
                      `Overall Wellbeing: ${w.id}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
