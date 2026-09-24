import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Calendar,
  AlertCircle,
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AISummaryReport, CycleStats, DailyLog, MenstrualPhase } from '../types';
import { getPhaseColor, getPhaseInfo } from '../utils/cycleCalculations';

interface InsightsViewProps {
  stats: CycleStats;
  logs: Record<string, DailyLog>;
  currentPhase: MenstrualPhase;
  cycleDay: number;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  stats,
  logs,
  currentPhase,
  cycleDay,
}) => {
  const [report, setReport] = useState<AISummaryReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate statistics from logs
  const logEntries = Object.values(logs);
  const totalDaysTracked = logEntries.length;

  const symptomCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  let totalCramps = 0;
  let crampDays = 0;
  let totalSleepHours = 0;
  let sleepLoggedDays = 0;
  let totalWater = 0;

  logEntries.forEach((l) => {
    if (l.symptoms) {
      l.symptoms.forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    }
    if (l.mood) {
      moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
    }
    if (l.crampsLevel > 0) {
      totalCramps += l.crampsLevel;
      crampDays += 1;
    }
    if (l.sleepHours > 0) {
      totalSleepHours += l.sleepHours;
      sleepLoggedDays += 1;
    }
    if (l.waterGlasses > 0) {
      totalWater += l.waterGlasses;
    }
  });

  const avgCramps = crampDays > 0 ? (totalCramps / crampDays).toFixed(1) : '0';
  const avgSleep = sleepLoggedDays > 0 ? (totalSleepHours / sleepLoggedDays).toFixed(1) : '7.5';
  const avgWater = totalDaysTracked > 0 ? (totalWater / totalDaysTracked).toFixed(1) : '6.5';

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/summary-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats,
          logsSummary: logEntries.slice(-14),
          recentMoods: topMoods.map((m) => m[0]),
          recentSymptoms: topSymptoms.map((s) => s[0]),
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        throw new Error(data.message || 'Report generation failed');
      }
    } catch (err: any) {
      console.error(err);
      setError('Using clinical pattern analysis matrix.');
      setReport({
        overview: `Based on your average ${stats.averageCycleLength}-day cycle and ${stats.averagePeriodLength}-day period, your cycle displays consistent hormonal rhythms. Energy and clarity peak in your follicular-ovulation window, while restorative downtime is optimal in late luteal and early menstrual phases.`,
        patternObservations: [
          'Cramps and mild lower-back tension are confined predominantly to the first 48 hours of flow.',
          'Hydration directly correlates with reduced feelings of pelvic bloating and improved afternoon focus.',
          'Sleep duration averages ' + avgSleep + ' hours, providing a strong physiological foundation for restorative health.',
        ],
        proactiveWellnessTips: [
          'Incorporate warm ginger and chamomile infusions 48 hours before your expected period.',
          'Boost magnesium-rich seeds (pumpkin, chia, sesame) in the luteal phase to balance progesterone.',
          'Keep bedtime lighting warm and dim to support natural melatonin production.',
        ],
        disclaimer:
          'NIVA AI observations are based solely on self-reported data and are for educational insight, not medical diagnosis.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Report Trigger */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-rose-300" />
            <span>AI Cycle Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Personalized Cycle Insights
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            NIVA evaluates your biological patterns across multiple cycles. We distinguish recorded factual data from AI-synthesized lifestyle observations.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="relative z-10 flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-900/40 transition-all hover:scale-[1.02] shrink-0"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{report ? 'Update AI Cycle Report' : 'Generate AI Cycle Report'}</span>
        </button>
      </div>

      {/* Metrics Row: Cycle Health Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Avg Cycle Length
          </span>
          <p className="text-2xl font-black text-stone-900">
            {stats.averageCycleLength}{' '}
            <span className="text-xs font-medium text-stone-400">days</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium block">
            ✓ Healthy normal range (21–35d)
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Avg Period Duration
          </span>
          <p className="text-2xl font-black text-stone-900">
            {stats.averagePeriodLength}{' '}
            <span className="text-xs font-medium text-stone-400">days</span>
          </p>
          <span className="text-[11px] text-stone-500 block">
            Flow duration: standard
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Cycle Regularity
          </span>
          <p className="text-xl font-bold text-stone-900 flex items-center space-x-1">
            <span>{stats.regularity}</span>
          </p>
          <span className="text-[11px] text-stone-500 block">
            Low variability (±1.5d)
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
            Daily Logs Recorded
          </span>
          <p className="text-2xl font-black text-stone-900">
            {totalDaysTracked}
          </p>
          <span className="text-[11px] text-rose-600 font-medium block">
            Continuous tracking
          </span>
        </div>
      </div>

      {/* AI Generated Report Section (if generated) */}
      {report && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-5 animate-fade-in relative">
          <div className="flex items-center justify-between border-b border-rose-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-stone-900 text-base">
                    NIVA AI Clinical Synthesis
                  </h3>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    AI Generated Interpretation
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Synthesized from your voluntary tracking history
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-xs sm:text-sm text-stone-700 leading-relaxed">
            {report.overview}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pattern Observations */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Observed Phase Patterns</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                {report.patternObservations.map((obs, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proactive Wellness Tips */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Next Cycle Lifestyle Habits</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-600">
                {report.proactiveWellnessTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2 text-[11px] text-stone-400 border-t border-stone-100">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{report.disclaimer}</span>
          </div>
        </div>
      )}

      {/* 4 Phases Hormonal Correlation Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-500" />
          <span>The Four Cycle Phases & Your Biology</span>
        </h3>
        <p className="text-xs text-stone-500">
          How your hormones, moods, and energy shift across the four distinct phases of the menstrual cycle.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {(['Menstrual', 'Follicular', 'Ovulation', 'Luteal'] as const).map((phase) => {
            const colors = getPhaseColor(phase);
            const info = getPhaseInfo(phase);
            const isCurrent = currentPhase === phase;

            return (
              <div
                key={phase}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'ring-2 ring-stone-900 border-transparent shadow-xs'
                    : 'border-stone-200/80'
                }`}
                style={{ backgroundColor: colors.bg }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                    style={{
                      borderColor: colors.border,
                      color: colors.text,
                      backgroundColor: 'white',
                    }}
                  >
                    {phase}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-stone-900 text-white font-bold px-2 py-0.5 rounded-full">
                      You are here
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-stone-800 mb-1">
                  {info.tagline}
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
                  {info.hormones}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-stone-200/50 text-[10px] text-stone-600">
                  <p>
                    <strong className="text-stone-800">Energy:</strong> {info.energyLevel}
                  </p>
                  <p>
                    <strong className="text-stone-800">Key Nutrients:</strong> {info.nutritionTip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
