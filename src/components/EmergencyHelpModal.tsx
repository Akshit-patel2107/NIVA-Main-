import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  PhoneCall,
  HeartPulse,
  Share2,
  Check,
  MapPin,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { CycleStats, DailyLog } from '../types';

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CycleStats;
  todayLog?: DailyLog;
  cycleDay: number;
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({
  isOpen,
  onClose,
  stats,
  todayLog,
  cycleDay,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateReportSummary = () => {
    return `[NIVA Health Report - For Clinical Review]
Date: ${new Date().toLocaleDateString()}
Cycle Status: Day ${cycleDay} of ${stats.averageCycleLength}-day cycle
Reported Flow: ${todayLog?.flow || 'Not recorded'}
Pelvic Pain / Cramps Level: ${todayLog?.crampsLevel ?? 0} / 5
Logged Symptoms: ${todayLog?.symptoms?.join(', ') || 'None logged'}
Discharge Type: ${todayLog?.discharge || 'None'}
Personal Notes: ${todayLog?.notes || 'None'}
Historical Average Cycle: ${stats.averageCycleLength} days (Flow: ${stats.averagePeriodLength} days)
Regularity: ${stats.regularity}

Generated via NIVA Menstrual Wellness Platform. NIVA is an educational health-tech companion and is not an emergency triage or medical diagnosis service.`;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReportSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-red-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Emergency & Health Red-Flag Guide
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Immediate clinical indicators, verified helplines, and doctor summary share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-100 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Red Flag Warning Box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-red-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>When to Seek Immediate Emergency or Urgent Medical Care</span>
            </div>
            <ul className="text-xs text-red-950 space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>
                <strong>Abnormally Heavy Bleeding (Menorrhagia):</strong> Soaking through a sanitary pad or tampon in 1 hour or less for 2 or more consecutive hours.
              </li>
              <li>
                <strong>Blood Clots larger than a quarter:</strong> Frequent passage of large clots accompanied by dizziness or feeling faint.
              </li>
              <li>
                <strong>Sudden High Fever during your period:</strong> Fever above 101°F (38.3°C) accompanied by a sunburn-like skin rash, vomiting, or low blood pressure (possible TSS warning).
              </li>
              <li>
                <strong>Incapacitating Pelvic Pain:</strong> Pain that causes vomiting, inability to stand, or is unresponsive to standard over-the-counter pain medication.
              </li>
              <li>
                <strong>Periods lasting more than 7 days</strong> with continuous bright red flow.
              </li>
            </ul>
          </div>

          {/* Quick Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Direct Health Helplines (Confidential & Free)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>National Women’s Health Helpline</span>
                </div>
                <p className="text-[11px] text-stone-500">Government-sponsored free health counseling</p>
                <a
                  href="tel:18009949662"
                  className="inline-block mt-1 text-xs font-extrabold text-rose-600 hover:text-rose-700 underline"
                >
                  1-800-994-9662
                </a>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-purple-600" />
                  <span>Teen Crisis & Mental Health Line</span>
                </div>
                <p className="text-[11px] text-stone-500">24/7 confidential crisis line (Call or Text)</p>
                <a
                  href="tel:988"
                  className="inline-block mt-1 text-xs font-extrabold text-purple-600 hover:text-purple-700 underline"
                >
                  Call or Text: 988
                </a>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Find Nearest Women’s Clinic</span>
                </div>
                <p className="text-[11px] text-stone-500">Reproductive health & adolescent care</p>
                <a
                  href="https://www.plannedparenthood.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1 text-xs font-extrabold text-teal-600 hover:text-teal-700 underline"
                >
                  Planned Parenthood Locator →
                </a>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-1">
                <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Emergency Response</span>
                </div>
                <p className="text-[11px] text-stone-500">For life-threatening emergencies or acute collapse</p>
                <a
                  href="tel:911"
                  className="inline-block mt-1 text-xs font-extrabold text-red-600 hover:text-red-700 underline"
                >
                  Call 911 (or local emergency)
                </a>
              </div>
            </div>
          </div>

          {/* Export Doctor Report */}
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-stone-800 font-bold text-xs">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Doctor Summary Generator</span>
              </div>
              <button
                onClick={copyReport}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-600">
              Share your cycle data, current pain score, and logged symptoms directly with your doctor, school nurse, or parent.
            </p>
            <pre className="text-[11px] p-3 rounded-xl bg-white border border-stone-200 text-stone-700 whitespace-pre-wrap font-mono leading-relaxed">
              {generateReportSummary()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
