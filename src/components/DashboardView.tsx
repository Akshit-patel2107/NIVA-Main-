import React from 'react';
import {
  Calendar,
  Activity,
  Heart,
  Droplet,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Clock,
  Compass,
  Smile,
  ShieldCheck,
  ChevronRight,
  Zap,
  Moon,
} from 'lucide-react';
import { CycleStatus, formatDisplayDate, getPhaseColor, getPhaseInfo } from '../utils/cycleCalculations';
import { CycleStats, DailyLog, NavigationTab, UserAccount, UserPreferences } from '../types';
import { CycleDial } from './CycleDial';

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
}) => {
  const phaseColors = getPhaseColor(status.currentPhase);
  const phaseInfo = getPhaseInfo(status.currentPhase);
  const isDiscreet = preferences.discreetMode;

  const currentWater = todayLog?.waterGlasses || 6;

  const handleQuickAddWater = () => {
    const updated: DailyLog = {
      ...(todayLog || {
        date: new Date().toISOString().split('T')[0],
        flow: 'None',
        crampsLevel: 0,
        mood: 'Calm',
        symptoms: [],
        discharge: 'None',
        sleepHours: 7.5,
        sleepQuality: 'Good',
        stressLevel: 2,
        energyLevel: 3,
        exerciseMinutes: 20,
      }),
      waterGlasses: currentWater + 1,
    };
    onUpdateDailyLog(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Status Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/80 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
              Cycle {stats.averageCycleLength}d
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-serif-accent mt-0.5">
            Good day, {account.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-stone-500">
            {isDiscreet
              ? 'Your wellness balance is steady today.'
              : `You are in your ${status.currentPhase} phase. Focus on ${phaseInfo.tagline.toLowerCase()}.`}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenLogModal()}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Today</span>
          </button>
        </div>
      </div>

      {/* Primary Circular Cycle Dial */}
      <CycleDial
        status={status}
        stats={stats}
        todayLog={todayLog}
        preferences={preferences}
        onOpenLogModal={() => onOpenLogModal()}
        onOpenAI={onOpenAI}
        onNavigateTab={onNavigateTab}
      />

      {/* Snapshot Cards Grid: Period Countdown, Fertile Window, Wellness */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Next Period Prediction */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-400">
              Next Period Window
            </span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {isDiscreet ? 'Upcoming Cycle' : formatDisplayDate(status.nextPeriodDate)}
          </p>
          <p className="text-xs text-rose-600 font-medium">
            {isDiscreet
              ? `Estimated in ${status.daysUntilNextPeriod} days`
              : status.daysUntilNextPeriod === 0
              ? 'Predicted to start today'
              : `In approximately ${status.daysUntilNextPeriod} days`}
          </p>
        </div>

        {/* Fertile Window Estimate */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-400">
              Fertile Window
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">
            {isDiscreet ? 'Normal Rhythm' : status.fertilityLevel.split(' ')[0]}
          </p>
          <p className="text-xs text-purple-700 font-medium">
            {isDiscreet
              ? 'Hormones balanced'
              : `Est. window: ${formatDisplayDate(status.fertileWindowStart)} – ${formatDisplayDate(status.fertileWindowEnd)}`}
          </p>
        </div>

        {/* Today's Hydration & Quick Add */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-400">
              Daily Hydration
            </span>
            <span className="text-xs text-blue-600 font-bold">{currentWater} / 8</span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-black text-stone-900">
              {(currentWater * 0.25).toFixed(1)}{' '}
              <span className="text-xs font-normal text-stone-400">Liters</span>
            </p>
            <button
              onClick={handleQuickAddWater}
              className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + 1 Glass
            </button>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (currentWater / 8) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Wellness & Symptoms Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Logged State */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Today’s Wellness Summary</span>
            </h3>
            <button
              onClick={() => onNavigateTab('track')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center"
            >
              <span>Full Journal</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Current Mood
              </span>
              <span className="font-bold text-stone-800 text-sm">
                {todayLog?.mood || 'Calm (Default)'}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Sleep Duration
              </span>
              <span className="font-bold text-stone-800 text-sm">
                {todayLog?.sleepHours || 7.5} hrs{' '}
                <span className="text-[10px] font-normal text-stone-400">
                  ({todayLog?.sleepQuality || 'Good'})
                </span>
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Energy Level
              </span>
              <span className="font-bold text-stone-800 text-sm">
                {todayLog?.energyLevel || 3} / 5
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">
                Stress Level
              </span>
              <span className="font-bold text-stone-800 text-sm">
                {todayLog?.stressLevel || 2} / 5
              </span>
            </div>
          </div>

          {/* Logged Symptoms Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-stone-500 block">
              Reported Symptoms Today:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {todayLog?.symptoms && todayLog.symptoms.length > 0 ? (
                todayLog.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-0.5 rounded-lg font-medium"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-400 italic">
                  No physical discomfort reported today.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Teaser Card */}
        <div className="bg-gradient-to-br from-stone-900 to-rose-950 text-white p-6 rounded-3xl shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-rose-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                NIVA AI Companion
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              Curious about your body’s signals?
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Ask about cycle shifts, foods to balance prostaglandins, or how sleep changes across your cycle. NIVA provides compassionate, medically-sound answers.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={onOpenAI}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Ask NIVA AI Now
            </button>
            <button
              onClick={() => onNavigateTab('insights')}
              className="text-xs font-semibold text-stone-300 hover:text-white underline"
            >
              View Cycle Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
