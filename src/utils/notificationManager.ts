import {
  DailyLog,
  CycleStats,
  PadCareSettings,
  PadPrivacyMode,
  NotificationType,
  NivaNotification,
} from '../types';

/**
 * Calculates a personalized reminder interval in hours based on historical logged pad changes.
 * Defaults to 4.0 hours with gentle guidance.
 */
export function calculatePersonalizedPadInterval(
  logs: Record<string, DailyLog>
): { hours: number; sampleCount: number; isDefault: boolean } {
  const intervalsInHours: number[] = [];

  Object.values(logs).forEach((log) => {
    // 1. From detailed timestamp history if available
    if (log.padChangeHistory && log.padChangeHistory.length >= 2) {
      const sorted = [...log.padChangeHistory].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      for (let i = 1; i < sorted.length; i++) {
        const diffMs =
          new Date(sorted[i].timestamp).getTime() -
          new Date(sorted[i - 1].timestamp).getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        // Realistic awake change intervals between 1.5 and 7 hours
        if (diffHrs >= 1.5 && diffHrs <= 7) {
          intervalsInHours.push(diffHrs);
        }
      }
    } else if (log.padChangesCount && log.padChangesCount >= 2 && log.flow && log.flow !== 'None') {
      // 2. From daily pad change counts assuming ~14 hours awake active period
      const estimatedInterval = 14 / log.padChangesCount;
      if (estimatedInterval >= 1.5 && estimatedInterval <= 6) {
        intervalsInHours.push(estimatedInterval);
      }
    }
  });

  if (intervalsInHours.length >= 2) {
    const sum = intervalsInHours.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / intervalsInHours.length;
    // Round to nearest 0.5 hour (e.g. 3.0, 3.5, 4.0)
    const rounded = Math.round(avg * 2) / 2;
    const clamped = Math.max(2.0, Math.min(5.5, rounded));
    return {
      hours: clamped,
      sampleCount: intervalsInHours.length,
      isDefault: false,
    };
  }

  // Default gentle hygienic interval (4.0 hours)
  return {
    hours: 4.0,
    sampleCount: 0,
    isDefault: true,
  };
}

/**
 * Checks whether the current moment falls within the user's defined Quiet Hours.
 * Correctly handles overnight intervals like 22:00 to 07:00.
 */
export function isWithinQuietHours(
  quietHours: { enabled: boolean; start: string; end: string },
  now = new Date()
): boolean {
  if (!quietHours.enabled) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = (quietHours.start || '22:00').split(':').map(Number);
  const [endH, endM] = (quietHours.end || '07:00').split(':').map(Number);

  const startMinutes = (startH || 22) * 60 + (startM || 0);
  const endMinutes = (endH || 7) * 60 + (endM || 0);

  if (startMinutes > endMinutes) {
    // Overnight: e.g. 22:00 (1320m) to 07:00 (420m)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same-day: e.g. 13:00 to 15:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Resolves the effective interval in hours given user settings and log history.
 */
export function getEffectiveIntervalHours(
  padCare: PadCareSettings,
  logs: Record<string, DailyLog>
): { hours: number; isPersonalized: boolean } {
  if (padCare.frequency === 'auto') {
    const personalized = calculatePersonalizedPadInterval(logs);
    return { hours: personalized.hours, isPersonalized: true };
  }

  switch (padCare.frequency) {
    case '2h':
      return { hours: 2.0, isPersonalized: false };
    case '3h':
      return { hours: 3.0, isPersonalized: false };
    case '4h':
      return { hours: 4.0, isPersonalized: false };
    case '5h':
      return { hours: 5.0, isPersonalized: false };
    case '6h':
      return { hours: 6.0, isPersonalized: false };
    case 'custom':
      return { hours: padCare.customHours || 4.0, isPersonalized: false };
    default:
      return { hours: 4.0, isPersonalized: false };
  }
}

/**
 * Returns gentle, non-medical notification copy for each notification type,
 * providing both Private Mode and Detailed Mode representations.
 */
export function getNotificationText(type: NotificationType): {
  detailedTitle: string;
  detailedBody: string;
  privateTitle: string;
  privateBody: string;
} {
  switch (type) {
    case 'pad_check':
      return {
        detailedTitle: 'NIVA Pad Check Reminder',
        detailedBody:
          'It may be a good time to check your pad. Change it according to your flow, comfort, and hygiene needs.',
        privateTitle: 'NIVA',
        privateBody: 'You have a new NIVA reminder.',
      };
    case 'period_started':
      return {
        detailedTitle: 'NIVA Period Care',
        detailedBody:
          'Your period was logged as started. Have pads and comfort essentials ready, and take gentle care of yourself.',
        privateTitle: 'NIVA',
        privateBody: 'You have a new NIVA reminder.',
      };
    case 'period_care':
      return {
        detailedTitle: 'NIVA Gentle Reminder',
        detailedBody:
          'Remember to drink warm fluids, change pads as needed for fresh comfort, and honor your rhythm today.',
        privateTitle: 'NIVA',
        privateBody: 'You have a new NIVA reminder.',
      };
    case 'daily_checkin':
      return {
        detailedTitle: 'NIVA Daily Check-in',
        detailedBody:
          'How did your flow and energy feel today? A quick 5-second check-in keeps your rhythm journal personalized.',
        privateTitle: 'NIVA',
        privateBody: 'You have a new NIVA reminder.',
      };
  }
}

/**
 * Determine if period is currently active based on today's and recent days' logs.
 */
export function isPeriodCurrentlyActive(
  logs: Record<string, DailyLog>,
  todayStr: string
): boolean {
  const todayLog = logs[todayStr];
  if (todayLog) {
    if (todayLog.flow && todayLog.flow !== 'None') return true;
    if (todayLog.confirmedPeriod === true) return true;
  }

  // Check if yesterday or 2 days ago was active and today isn't explicitly marked as None
  const now = new Date(todayStr + 'T12:00:00Z');
  for (let i = 1; i <= 3; i++) {
    const prevDate = new Date(now.getTime() - i * 86400000).toISOString().split('T')[0];
    const prevLog = logs[prevDate];
    if (prevLog && prevLog.flow && prevLog.flow !== 'None') {
      // If today has an explicit log with 'None', period finished
      if (todayLog && todayLog.flow === 'None') {
        return false;
      }
      return true;
    }
  }

  return false;
}

/**
 * Determines whether a pad reminder should be scheduled/triggered.
 */
export function shouldTriggerPadReminder(
  padCare: PadCareSettings,
  logs: Record<string, DailyLog>,
  todayStr: string,
  now = new Date()
): { shouldTrigger: boolean; reason?: string; timeRemainingMs?: number } {
  if (!padCare.enabled) {
    return { shouldTrigger: false, reason: 'Reminders disabled in settings' };
  }

  if (padCare.activePeriodFinished) {
    return { shouldTrigger: false, reason: 'Period marked as finished' };
  }

  // Check if period is active
  const isActive = isPeriodCurrentlyActive(logs, todayStr);
  if (!isActive) {
    return { shouldTrigger: false, reason: 'No active period logged' };
  }

  // Check quiet hours
  if (isWithinQuietHours(padCare.quietHours, now)) {
    return { shouldTrigger: false, reason: 'Currently in Quiet Hours' };
  }

  const nowMs = now.getTime();

  // Check snooze
  if (padCare.snoozedUntil) {
    const snoozeMs = new Date(padCare.snoozedUntil).getTime();
    if (nowMs < snoozeMs) {
      return {
        shouldTrigger: false,
        reason: 'Snoozed',
        timeRemainingMs: snoozeMs - nowMs,
      };
    }
  }

  // Anti-spam cooldown: Don't trigger if notified within the last 30 minutes
  if (padCare.lastNotifiedAt) {
    const lastNotifiedMs = new Date(padCare.lastNotifiedAt).getTime();
    const cooldownMs = 30 * 60 * 1000;
    if (nowMs - lastNotifiedMs < cooldownMs) {
      return {
        shouldTrigger: false,
        reason: 'In anti-spam cooldown',
        timeRemainingMs: cooldownMs - (nowMs - lastNotifiedMs),
      };
    }
  }

  // Calculate reminder threshold
  const { hours } = getEffectiveIntervalHours(padCare, logs);
  const intervalMs = hours * 3600 * 1000;

  // Reference time: either last pad change or morning start/last log
  let referenceMs = nowMs - intervalMs; // fallback
  if (padCare.lastPadChangeTime) {
    referenceMs = new Date(padCare.lastPadChangeTime).getTime();
  } else {
    // If no pad change logged yet today, reference 8:00 AM of today or start of period
    const morning = new Date(now);
    morning.setHours(8, 0, 0, 0);
    referenceMs = morning.getTime();
  }

  const elapsedMs = nowMs - referenceMs;
  if (elapsedMs >= intervalMs) {
    return { shouldTrigger: true, timeRemainingMs: 0 };
  }

  return {
    shouldTrigger: false,
    reason: 'Interval not yet reached',
    timeRemainingMs: intervalMs - elapsedMs,
  };
}

/**
 * System notification permission helper.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function getSystemNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Dispatches a native browser notification if granted.
 */
export function sendSystemNotification(
  notification: NivaNotification,
  privacyMode: PadPrivacyMode,
  onClick?: () => void
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const isPrivate = privacyMode === 'private';
    const textInfo = getNotificationText(notification.type);

    const title = isPrivate ? textInfo.privateTitle : textInfo.detailedTitle;
    const body = isPrivate ? textInfo.privateBody : textInfo.detailedBody;

    const notif = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `niva-${notification.type}-${notification.id}`,
      badge: '/favicon.ico',
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
      if (onClick) onClick();
    };
  } catch (err) {
    console.warn('System notification error:', err);
  }
}

/**
 * Storage helpers for in-app notification center history.
 */
export function loadNotificationsFromStorage(userId?: string): NivaNotification[] {
  try {
    const key = userId ? `niva_${userId}_notifs` : 'niva_notifs';
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotificationsToStorage(
  notifications: NivaNotification[],
  userId?: string
): void {
  try {
    const key = userId ? `niva_${userId}_notifs` : 'niva_notifs';
    // Keep at most 20 recent notifications to avoid storage bloat
    const trimmed = notifications.slice(0, 20);
    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save notifications:', e);
  }
}
