import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  Droplet,
  Heart,
} from 'lucide-react';
import { PadCareSettings, PadReminderFrequency, DailyLog } from '../types';
import {
  calculatePersonalizedPadInterval,
  requestNotificationPermission,
} from '../utils/notificationManager';

interface PadReminderPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Record<string, DailyLog>;
  onEnable: (settings: Partial<PadCareSettings>) => void;
  onMaybeLater: () => void;
}

export const PadReminderPromptModal: React.FC<PadReminderPromptModalProps> = ({
  isOpen,
  onClose,
  logs,
  onEnable,
  onMaybeLater,
}) => {
  const [step, setStep] = useState<'prompt' | 'frequency'>('prompt');
  const personalized = calculatePersonalizedPadInterval(logs);
  const [selectedFreq, setSelectedFreq] = useState<PadReminderFrequency>('auto');

  if (!isOpen) return null;

  const handleConfirmEnable = async () => {
    // Attempt to request browser permission politely
    if (typeof window !== 'undefined' && 'Notification' in window) {
      await requestNotificationPermission();
    }

    onEnable({
      enabled: true,
      frequency: selectedFreq,
      lastPadChangeTime: new Date().toISOString(),
      activePeriodFinished: false,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pad-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header graphic banner */}
        <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-purple-600 p-6 text-white text-center relative">
          <button
            onClick={onMaybeLater}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
            <Bell className="w-7 h-7 text-white" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-200 block mb-1">
            Pad Care Assistant
          </span>
          <h3 id="pad-prompt-title" className="text-xl font-bold font-serif-accent">
            Would you like NIVA to remind you to check your pad?
          </h3>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-stone-700">
          {step === 'prompt' ? (
            <>
              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-stone-600">
                  During your period, regular check-ins keep you comfortable, confident, and feeling fresh throughout the day.
                </p>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/60 flex items-start space-x-3">
                  <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-900 leading-snug">
                    <strong>Gentle & Non-Medical:</strong> Reminders say <em>“It may be a good time to check your pad. Change it according to your flow, comfort, and hygiene needs.”</em> We never present a fixed interval as a medical requirement.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Private Mode is enabled by default so your lock screen remains confidential.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setStep('frequency')}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enable Reminders</span>
                </button>

                <button
                  onClick={onMaybeLater}
                  className="w-full py-2.5 px-4 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Choose preferred reminder frequency */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 mb-0.5">
                    Choose Your Preferred Reminder Frequency
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Select a comfortable rhythm. You can customize quiet hours or change this anytime.
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Option 1: Personalized */}
                  <button
                    onClick={() => setSelectedFreq('auto')}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between ${
                      selectedFreq === 'auto'
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                        : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-xs font-bold text-stone-900">
                          Personalized Rhythm
                        </span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                          ~{personalized.hours}h
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {personalized.isDefault
                          ? 'Adapts to your logged pad changes over time. Starts at a gentle ~4-hour pace.'
                          : `Calculated from your ${personalized.sampleCount} previous logged pad changes.`}
                      </p>
                    </div>
                    {selectedFreq === 'auto' && (
                      <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>

                  {/* Standard options */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: '2h', label: 'Every 2 hours', desc: 'Frequent flow' },
                      { id: '3h', label: 'Every 3 hours', desc: 'Medium rhythm' },
                      { id: '4h', label: 'Every 4 hours', desc: 'Hygienic standard' },
                      { id: '6h', label: 'Every 6 hours', desc: 'Lighter flow' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedFreq(opt.id as PadReminderFrequency)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedFreq === opt.id
                            ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400 text-rose-900 font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{opt.label}</span>
                        <span className="text-[10px] text-stone-500 block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => setStep('prompt')}
                  className="px-4 py-2.5 rounded-2xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmEnable}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Gentle Reminders</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
