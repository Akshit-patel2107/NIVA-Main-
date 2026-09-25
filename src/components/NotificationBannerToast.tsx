import React from 'react';
import {
  Bell,
  Check,
  Clock,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Droplet,
} from 'lucide-react';
import { NivaNotification, PadPrivacyMode } from '../types';
import { getNotificationText } from '../utils/notificationManager';

interface NotificationBannerToastProps {
  notification: NivaNotification | null;
  privacyMode: PadPrivacyMode;
  onChangedIt: () => void;
  onRemindLater: () => void;
  onOpenNiva: () => void;
  onDismiss: () => void;
}

export const NotificationBannerToast: React.FC<NotificationBannerToastProps> = ({
  notification,
  privacyMode,
  onChangedIt,
  onRemindLater,
  onOpenNiva,
  onDismiss,
}) => {
  if (!notification) return null;

  const textInfo = getNotificationText(notification.type);
  const isPrivate = privacyMode === 'private';
  const displayTitle = isPrivate ? textInfo.privateTitle : textInfo.detailedTitle;
  const displayBody = isPrivate ? textInfo.privateBody : textInfo.detailedBody;

  return (
    <aside
      aria-label="NIVA Notification Alert"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md z-50 animate-slide-up"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-200/90 ring-1 ring-stone-900/5 space-y-3.5">
        {/* Top bar with icon and close button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-stone-900 font-serif-accent">
                  {displayTitle}
                </span>
                {isPrivate && (
                  <span className="text-[9px] bg-stone-100 text-stone-600 font-semibold px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Private</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400">Just now • Smart reminder</span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <p className="text-xs text-stone-700 leading-relaxed font-medium">
          {displayBody}
        </p>

        {/* Action Buttons: "I Changed It", "Remind Me Later", "Open NIVA" */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {notification.type === 'pad_check' && (
            <button
              onClick={onChangedIt}
              className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>I Changed It</span>
            </button>
          )}

          <button
            onClick={onRemindLater}
            className="flex-1 min-w-[110px] py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>Remind Later</span>
          </button>

          <button
            onClick={onOpenNiva}
            className="py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition-colors flex items-center justify-center space-x-1"
            title="Open NIVA Tracker"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
