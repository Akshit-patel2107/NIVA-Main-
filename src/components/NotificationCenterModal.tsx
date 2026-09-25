import React from 'react';
import {
  Bell,
  Check,
  Clock,
  Settings,
  X,
  Droplet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  NivaNotification,
  PadCareSettings,
  PadPrivacyMode,
  DailyLog,
  NavigationTab,
} from '../types';
import {
  getEffectiveIntervalHours,
  getNotificationText,
  isPeriodCurrentlyActive,
} from '../utils/notificationManager';
import { formatDisplayDate } from '../utils/cycleCalculations';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NivaNotification[];
  padCare: PadCareSettings;
  privacyMode: PadPrivacyMode;
  logs: Record<string, DailyLog>;
  todayStr: string;
  onLogPadChange: () => void;
  onRemindLater: () => void;
  onTriggerTestNotification: () => void;
  onClearNotifications: () => void;
  onOpenSettings: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  padCare,
  privacyMode,
  logs,
  todayStr,
  onLogPadChange,
  onRemindLater,
  onTriggerTestNotification,
  onClearNotifications,
  onOpenSettings,
}) => {
  if (!isOpen) return null;

  const isPeriodActive = isPeriodCurrentlyActive(logs, todayStr);
  const effective = getEffectiveIntervalHours(padCare, logs);
  const todayLog = logs[todayStr];
  const padChangesCount = todayLog?.padChangesCount || 0;

  // Compute time since last change
  let lastChangeLabel = 'No change logged today';
  if (padCare.lastPadChangeTime) {
    const lastDate = new Date(padCare.lastPadChangeTime);
    lastChangeLabel = lastDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-center-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 id="notif-center-title" className="text-base font-bold text-stone-900 font-serif-accent">
                NIVA Notifications & Reminders
              </h3>
              <p className="text-[11px] text-stone-500">
                Smart, quiet menstrual health & pad care companion
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              title="Notification Settings"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-stone-700">
          {/* Pad Care Live Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 to-purple-50/70 border border-rose-200/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Active Pad Care System
                </span>
                <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                  {padCare.enabled
                    ? isPeriodActive
                      ? 'Pad Reminders are Active'
                      : 'Reminders Paused (No Active Period)'
                    : 'Pad Reminders are Disabled'}
                </h4>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  padCare.enabled && isPeriodActive
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {padCare.enabled && isPeriodActive ? 'Running' : 'Paused'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/60 space-y-0.5">
                <span className="text-stone-400 font-semibold block">Cadence</span>
                <span className="font-bold text-stone-800 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-rose-500" />
                  <span>
                    ~{effective.hours} hours {effective.isPersonalized && '(Personalized)'}
                  </span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/60 space-y-0.5">
                <span className="text-stone-400 font-semibold block">Last Pad Change</span>
                <span className="font-bold text-stone-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  <span>{lastChangeLabel}</span>
                </span>
              </div>
            </div>

            {/* Quick Log Pad Change button */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onLogPadChange}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Log Pad Change Now ({padChangesCount} today)</span>
              </button>

              <button
                onClick={onTriggerTestNotification}
                className="py-2 px-3 rounded-xl border border-stone-300 hover:bg-white text-stone-700 font-semibold text-xs transition-colors"
                title="Trigger a preview reminder notification"
              >
                Test Preview
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center space-x-2 text-[11px] text-stone-500 px-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Display Mode:{' '}
              <strong className="text-stone-700">
                {privacyMode === 'private' ? 'Private Mode (Confidential)' : 'Detailed Mode'}
              </strong>
              . You can change this in Notification Settings.
            </span>
          </div>

          {/* Notification History List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Recent Reminders & History
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={onClearNotifications}
                  className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-1.5">
                <Bell className="w-6 h-6 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-stone-600">No active notifications</p>
                <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                  NIVA is designed to be quiet and peaceful. You will only receive reminders when your period is active.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => {
                  const textInfo = getNotificationText(notif.type);
                  const isPrivate = privacyMode === 'private';
                  const title = isPrivate ? textInfo.privateTitle : textInfo.detailedTitle;
                  const body = isPrivate ? textInfo.privateBody : textInfo.detailedBody;

                  return (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="font-bold text-stone-900 text-xs">{title}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-snug">{body}</p>

                      {notif.type === 'pad_check' && (
                        <div className="flex items-center space-x-2 pt-1 border-t border-stone-200/50">
                          <button
                            onClick={onLogPadChange}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>I Changed It</span>
                          </button>
                          <button
                            onClick={onRemindLater}
                            className="px-2.5 py-1 rounded-lg bg-stone-200/70 hover:bg-stone-300 text-stone-700 text-[11px] font-medium transition-colors flex items-center space-x-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Remind Me Later</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Open Notification Settings</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
