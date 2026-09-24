import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  Edit3,
  Droplet,
  Heart,
  Activity,
  Flame,
} from 'lucide-react';
import { CycleStats, DailyLog, UserPreferences } from '../types';
import {
  formatDate,
  parseDate,
  diffInDays,
  addDays,
  computeCycleStatus,
  formatDisplayDate,
  getPhaseColor,
} from '../utils/cycleCalculations';

interface CalendarViewProps {
  stats: CycleStats;
  logs: Record<string, DailyLog>;
  preferences: UserPreferences;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
  onOpenLogModal: (dateStr?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  stats,
  logs,
  preferences,
  onSelectDate,
  selectedDate,
  onOpenLogModal,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [viewMode, setViewMode] = useState<'month' | 'cycle'>('month');

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(formatDate(today));
  };

  const monthName = currentMonthDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate calendar grid days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const todayStr = formatDate(new Date());

  // Helper to determine day status
  const getDayAttributes = (day: number) => {
    const dateObj = new Date(year, month, day);
    const dateStr = formatDate(dateObj);
    const log = logs[dateStr];

    const cycleStatus = computeCycleStatus(
      stats.lastPeriodStart,
      stats.averageCycleLength,
      stats.averagePeriodLength,
      dateStr
    );

    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    
    // Confirmed period: explicitly logged with flow != 'None' or confirmedPeriod = true
    const isConfirmedPeriod = Boolean(log && log.flow && log.flow !== 'None');
    
    // Predicted period: calculated cycle period day AND not explicitly marked as None by user
    const isPredictedPeriod = !isConfirmedPeriod && cycleStatus.isPeriodDay && (!log || log.flow === undefined);
    
    const isFertile =
      cycleStatus.fertilityLevel.includes('Fertile') ||
      cycleStatus.fertilityLevel.includes('Peak');
    const isOvulation = cycleStatus.fertilityLevel.includes('Peak');

    const hasSymptoms = Boolean(log && log.symptoms && log.symptoms.length > 0);
    const hasMood = Boolean(log && log.mood);
    const hasWellness = Boolean(log && (log.waterGlasses > 0 || log.sleepHours > 0));

    return {
      dateStr,
      isToday,
      isSelected,
      isConfirmedPeriod,
      isPredictedPeriod,
      isFertile,
      isOvulation,
      hasSymptoms,
      hasMood,
      hasWellness,
      flow: log?.flow || 'None',
      log,
      cycleDay: cycleStatus.cycleDay,
      currentPhase: cycleStatus.currentPhase,
    };
  };

  const selectedLog = logs[selectedDate];
  const selectedStatus = computeCycleStatus(
    stats.lastPeriodStart,
    stats.averageCycleLength,
    stats.averagePeriodLength,
    selectedDate
  );
  const selectedPhaseColor = getPhaseColor(selectedStatus.currentPhase);

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-sm space-y-6">
        {/* Month Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                {monthName}
              </h2>
              <p className="text-xs text-stone-500">
                Predicted next cycle start:{' '}
                <span className="font-semibold text-rose-600">
                  {formatDisplayDate(selectedStatus.nextPeriodDate)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Today
            </button>

            <div className="flex items-center space-x-1 border border-stone-200 rounded-lg p-0.5">
              <button
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs bg-stone-50/80 p-3 rounded-2xl border border-stone-100">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 shadow-xs" />
            <span className="text-stone-700 font-medium">Logged Period</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-rose-400 bg-rose-50" />
            <span className="text-stone-700 font-medium">Predicted Period</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-200 border border-purple-300" />
            <span className="text-stone-700 font-medium">Fertile Window</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-stone-700 font-medium">Peak Ovulation</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-stone-500">Logged Symptoms</span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-xl" />;
            }

            const attr = getDayAttributes(day);

            let bgClass = 'bg-stone-50/40 text-stone-700 hover:bg-rose-50/40';
            let borderClass = 'border border-transparent';

            if (attr.isConfirmedPeriod) {
              bgClass = 'bg-rose-600 text-white font-bold shadow-xs';
            } else if (attr.isPredictedPeriod) {
              bgClass = 'bg-rose-50 text-rose-800 font-semibold';
              borderClass = 'border-2 border-dashed border-rose-300';
            } else if (attr.isOvulation) {
              bgClass = 'bg-purple-100 text-purple-900 font-bold';
              borderClass = 'border border-purple-300';
            } else if (attr.isFertile) {
              bgClass = 'bg-purple-50/60 text-purple-800';
            }

            if (attr.isSelected) {
              borderClass = 'ring-2 ring-stone-900 ring-offset-2';
            }

            return (
              <button
                key={`day-${day}`}
                onClick={() => onSelectDate(attr.dateStr)}
                className={`relative h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col justify-between items-center transition-all ${bgClass} ${borderClass}`}
              >
                {/* Day Number and Today Indicator */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      attr.isToday
                        ? attr.isConfirmedPeriod
                          ? 'bg-white text-rose-600 w-5 h-5 rounded-full flex items-center justify-center font-bold'
                          : 'bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold'
                        : 'font-medium'
                    }`}
                  >
                    {day}
                  </span>

                  {attr.isConfirmedPeriod && (
                    <Droplet className="w-2.5 h-2.5 text-rose-200 fill-rose-200" />
                  )}
                  {attr.isOvulation && (
                    <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                  )}
                </div>

                {/* Dots for logged information */}
                <div className="flex items-center space-x-1 mt-auto">
                  {attr.hasSymptoms && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        attr.isConfirmedPeriod ? 'bg-white' : 'bg-teal-500'
                      }`}
                      title="Symptoms logged"
                    />
                  )}
                  {attr.hasMood && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        attr.isConfirmedPeriod ? 'bg-rose-200' : 'bg-amber-400'
                      }`}
                      title="Mood logged"
                    />
                  )}
                  {attr.hasWellness && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        attr.isConfirmedPeriod ? 'bg-stone-200' : 'bg-blue-400'
                      }`}
                      title="Wellness logged"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1 border"
              style={{
                backgroundColor: selectedPhaseColor.bg,
                borderColor: selectedPhaseColor.border,
                color: selectedPhaseColor.text,
              }}
            >
              {selectedStatus.currentPhase} Phase • Day {selectedStatus.cycleDay}
            </span>
            <h3 className="text-lg font-bold text-stone-900">
              {formatDisplayDate(selectedDate, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
          </div>

          <button
            onClick={() => onOpenLogModal(selectedDate)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{selectedLog ? 'Edit Daily Log' : 'Log Details for this Day'}</span>
          </button>
        </div>

        {/* Selected Day Data Display */}
        {selectedLog ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Menstrual Flow
              </span>
              <p className="text-sm font-bold text-stone-800 flex items-center space-x-1.5">
                <Droplet className="w-4 h-4 text-rose-500" />
                <span>{selectedLog.flow || 'None'}</span>
              </p>
              {selectedLog.crampsLevel > 0 && (
                <p className="text-xs text-rose-600">
                  Cramps intensity: {selectedLog.crampsLevel} / 5
                </p>
              )}
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Mood & Symptoms
              </span>
              <p className="text-sm font-bold text-stone-800">
                {selectedLog.mood || 'Not specified'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedLog.symptoms && selectedLog.symptoms.length > 0 ? (
                  selectedLog.symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded-md text-stone-600"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400">No symptoms reported</span>
                )}
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100 space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Wellness Log
              </span>
              <div className="text-xs text-stone-600 space-y-0.5">
                <p>💧 Water: {selectedLog.waterGlasses || 0} glasses ({(selectedLog.waterGlasses || 0) * 0.25}L)</p>
                <p>💤 Sleep: {selectedLog.sleepHours || 0} hrs ({selectedLog.sleepQuality || 'Good'})</p>
                <p>⚡ Energy: {selectedLog.energyLevel || 3}/5 • Stress: {selectedLog.stressLevel || 2}/5</p>
              </div>
            </div>

            {selectedLog.notes && (
              <div className="sm:col-span-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
                  Personal Journal Notes
                </span>
                <p className="text-xs sm:text-sm text-stone-700 italic">
                  "{selectedLog.notes}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-stone-50/60 p-5 rounded-2xl border border-dashed border-stone-200 text-center space-y-2">
            <p className="text-xs sm:text-sm text-stone-500">
              No personal log recorded for {formatDisplayDate(selectedDate)}.
            </p>
            <p className="text-xs text-stone-400">
              Predicted status for this date: <span className="font-semibold text-stone-700">{selectedStatus.currentPhase} phase</span>,{' '}
              fertility {selectedStatus.fertilityLevel}.
            </p>
            <button
              onClick={() => onOpenLogModal(selectedDate)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline pt-1 inline-block"
            >
              + Add notes, flow, or symptoms for this day
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
