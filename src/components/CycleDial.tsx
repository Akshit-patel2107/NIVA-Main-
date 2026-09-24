import React from 'react';
import {
  Sparkles,
  Droplets,
  Calendar,
  Heart,
  Activity,
  PlusCircle,
  HelpCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { CycleStatus, getPhaseColor, getPhaseInfo } from '../utils/cycleCalculations';
import { CycleStats, DailyLog, UserPreferences } from '../types';

interface CycleDialProps {
  status: CycleStatus;
  stats: CycleStats;
  todayLog?: DailyLog;
  preferences: UserPreferences;
  onOpenLogModal: () => void;
  onOpenAI: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CycleDial: React.FC<CycleDialProps> = ({
  status,
  stats,
  todayLog,
  preferences,
  onOpenLogModal,
  onOpenAI,
  onNavigateTab,
}) => {
  const phaseColors = getPhaseColor(status.currentPhase);
  const phaseInfo = getPhaseInfo(status.currentPhase);
  const isDiscreet = preferences.discreetMode;

  // SVG Circular math
  const radius = 115;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Progress along total cycle
  const strokeDashoffset =
    circumference - (status.cycleDay / stats.averageCycleLength) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100/90 shadow-sm relative overflow-hidden transition-all">
      {/* Background subtle radial glow */}
      <div
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700"
        style={{ backgroundColor: phaseColors.bg }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{ backgroundColor: phaseColors.soft }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Main Circular Dial */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Track & Progress */}
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            >
              {/* Background circle track */}
              <circle
                stroke="#F4ECE9"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Active phase progress arc */}
              <circle
                stroke={phaseColors.primary}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{
                  strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease',
                  strokeLinecap: 'round',
                }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>

            {/* Inner Content inside Dial */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 select-none">
              <span
                className="text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full mb-1.5 border transition-all"
                style={{
                  backgroundColor: phaseColors.bg,
                  borderColor: phaseColors.border,
                  color: phaseColors.text,
                }}
              >
                {isDiscreet ? 'Phase In Progress' : `${status.currentPhase} Phase`}
              </span>

              <div className="my-0.5">
                <span className="text-4xl sm:text-5xl font-black text-stone-800 tracking-tight">
                  Day {status.cycleDay}
                </span>
                <span className="text-xs text-stone-400 block font-medium mt-0.5">
                  of {stats.averageCycleLength}-day cycle
                </span>
              </div>

              <div className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full flex items-center space-x-1.5 border border-rose-100/90 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {isDiscreet
                    ? `Next shift in ${status.daysUntilNextPeriod} days`
                    : status.daysUntilNextPeriod === 0
                    ? 'Period predicted today'
                    : status.daysUntilNextPeriod === 1
                    ? 'Period predicted tomorrow'
                    : `Period in ${status.daysUntilNextPeriod} days`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Fertility & Rhythm Pill */}
          <div className="mt-4 flex items-center space-x-2 text-xs text-stone-600 bg-stone-50/90 px-4 py-1.5 rounded-full border border-stone-200/70 shadow-2xs">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: phaseColors.primary }}
            />
            <span className="font-medium text-stone-500">
              {isDiscreet ? 'Biological Rhythm:' : 'Fertile Window:'}
            </span>
            <span className="font-semibold text-stone-800">
              {isDiscreet ? 'Consistent & Balanced' : status.fertilityLevel}
            </span>
          </div>
        </div>

        {/* Right Info & Actions Panel */}
        <div className="lg:col-span-7 space-y-4">
          {/* Phase Guidance Card */}
          <div className="bg-stone-50/70 rounded-2xl p-5 border border-stone-200/60 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: phaseColors.primary }}
                />
                <h3 className="text-sm sm:text-base font-bold text-stone-800">
                  {isDiscreet ? 'Current Biological Focus' : phaseInfo.tagline}
                </h3>
              </div>
              <button
                onClick={onOpenAI}
                className="text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 px-3 py-1 rounded-full flex items-center space-x-1.5 transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Ask NIVA AI</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {phaseInfo.hormones}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200/60 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-stone-100">
                <span className="font-semibold text-stone-700 block mb-0.5">🥗 Nutrition Sync</span>
                <p className="text-stone-500 text-[11px] leading-snug line-clamp-2">
                  {phaseInfo.nutritionTip}
                </p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-stone-100">
                <span className="font-semibold text-stone-700 block mb-0.5">🏃 Movement Focus</span>
                <p className="text-stone-500 text-[11px] leading-snug line-clamp-2">
                  {phaseInfo.movementTip}
                </p>
              </div>
            </div>

            {/* Today's Log Status */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-stone-600">
                <span className="font-semibold text-stone-700">Today's Flow:</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium">
                  {todayLog?.flow && todayLog.flow !== 'None' ? todayLog.flow : 'None reported'}
                </span>
              </div>

              {todayLog?.mood ? (
                <div className="flex items-center space-x-1 text-stone-600 bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
                  <span className="text-[11px] text-stone-400">Mood:</span>
                  <span className="font-medium">{todayLog.mood}</span>
                </div>
              ) : (
                <span className="text-[11px] text-stone-400 italic">No mood logged today</span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <button
              onClick={onOpenLogModal}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium text-xs shadow-xs transition-all hover:scale-[1.01]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Period & Flow</span>
            </button>

            <button
              onClick={() => onNavigateTab('track')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium text-xs shadow-2xs transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Track Symptoms</span>
            </button>

            <button
              onClick={() => onNavigateTab('calendar')}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium text-xs shadow-2xs transition-all col-span-2 sm:col-span-1"
            >
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>View Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
