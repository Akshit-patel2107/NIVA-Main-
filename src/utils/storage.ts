import {
  CycleStats,
  DailyLog,
  UserAccount,
  UserPreferences,
  AIConversationMessage,
  WomensHealthProfile,
} from '../types';
import { addDays, formatDate } from './cycleCalculations';

const today = new Date();
const todayStr = formatDate(today);
const defaultLastPeriodStart = addDays(todayStr, -14);

export const defaultHealthProfile: WomensHealthProfile = {
  completed: false,
  lastPeriodStart: defaultLastPeriodStart,
  averageCycleLength: 28,
  averagePeriodLength: 5,
  regularity: 'Regular',
  flowIntensity: 'Medium',
  crampsSeverity: 'Mild',
  clotting: 'None',
  periodProducts: ['Pads / Liners'],
  primaryGoal: 'Track period dates & predict next cycles',
  birthControl: 'None / Natural cycle',
  healthConditions: ['None / Healthy'],
  ageBracket: '25 – 34',
  commonPhysicalSymptoms: ['Cramps & pelvic ache', 'Bloating'],
  commonEmotionalSymptoms: ['Mood swings'],
};

export const defaultAccount: UserAccount = {
  id: '',
  name: '',
  email: '',
  ageRange: '26 - 32',
  isPrivateProfile: true,
  allowAIContext: true,
  emailVerified: false,
  isAuthenticated: false,
  consentAccepted: false,
  createdAt: todayStr,
  isDemoUser: false,
};

export const defaultPreferences: UserPreferences = {
  discreetMode: false,
  pinLockEnabled: false,
  pinCode: '',
  isLocked: false,
  notifications: {
    periodReminder: true,
    daysBeforePeriod: 2,
    symptomReminder: true,
    wellnessCheckin: true,
    discreteWording: true,
    waterReminder: true,
    padCare: {
      enabled: false,
      frequency: 'auto',
      customHours: 4,
      privacyMode: 'private', // Private Mode is default to protect sensitive menstrual info
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00',
      },
      lastPadChangeTime: undefined,
      lastNotifiedAt: undefined,
      snoozedUntil: undefined,
      activePeriodFinished: false,
    },
  },
  appearance: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'normal',
  },
  language: 'English',
};

export const defaultStats: CycleStats = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  regularity: 'Regular',
  lastPeriodStart: defaultLastPeriodStart,
  pastCycles: [],
};

export const defaultLogs: Record<string, DailyLog> = {};

export const defaultAIChatHistory: AIConversationMessage[] = [
  {
    id: 'msg-01',
    role: 'niva',
    content:
      'Welcome to NIVA. I am your certified menstrual health and cycle wellness companion. Feel free to ask about your hormonal phases, cramp soothing rituals, nutrition, sleep, or when symptoms warrant clinical evaluation. How can I support your wellbeing today?',
    time: 'Today',
  },
];

const getStorageKey = (prefix: string, userId?: string) =>
  userId ? `niva_${userId}_${prefix}` : `niva_${prefix}`;

// Account
export function loadAccount(userId?: string): UserAccount {
  try {
    const raw = localStorage.getItem(getStorageKey('account', userId));
    return raw ? { ...defaultAccount, ...JSON.parse(raw) } : defaultAccount;
  } catch {
    return defaultAccount;
  }
}

export function saveAccount(account: UserAccount): void {
  try {
    localStorage.setItem(getStorageKey('account', account.id), JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save account:', e);
  }
}

// Preferences
export function loadPreferences(userId?: string): UserPreferences {
  try {
    const raw = localStorage.getItem(getStorageKey('prefs', userId));
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw);
    return {
      ...defaultPreferences,
      ...parsed,
      notifications: {
        ...defaultPreferences.notifications,
        ...(parsed.notifications || {}),
        padCare: {
          ...defaultPreferences.notifications.padCare,
          ...(parsed.notifications?.padCare || {}),
          quietHours: {
            ...defaultPreferences.notifications.padCare.quietHours,
            ...(parsed.notifications?.padCare?.quietHours || {}),
          },
        },
      },
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: UserPreferences, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey('prefs', userId), JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

// Cycle stats
export function loadCycleStats(userId?: string): CycleStats {
  try {
    const raw = localStorage.getItem(getStorageKey('stats', userId));
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export function saveCycleStats(stats: CycleStats, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey('stats', userId), JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save cycle stats:', e);
  }
}

// Daily Logs
export function loadDailyLogs(userId?: string): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(getStorageKey('logs', userId));
    return raw ? JSON.parse(raw) : defaultLogs;
  } catch {
    return defaultLogs;
  }
}

export function saveDailyLogs(logs: Record<string, DailyLog>, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey('logs', userId), JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily logs:', e);
  }
}

// AI Chat history
export function loadAIChatHistory(userId?: string): AIConversationMessage[] {
  try {
    const raw = localStorage.getItem(getStorageKey('aichat', userId));
    return raw ? JSON.parse(raw) : defaultAIChatHistory;
  } catch {
    return defaultAIChatHistory;
  }
}

export function saveAIChatHistory(history: AIConversationMessage[], userId?: string): void {
  try {
    localStorage.setItem(getStorageKey('aichat', userId), JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save AI chat history:', e);
  }
}

export function clearAIChatHistory(userId?: string): void {
  try {
    localStorage.removeItem(getStorageKey('aichat', userId));
  } catch (e) {
    console.error('Failed to clear AI chat:', e);
  }
}

// Women's Health Profile
export function loadHealthProfile(userId?: string): WomensHealthProfile {
  try {
    const raw = localStorage.getItem(getStorageKey('health_profile', userId));
    return raw ? { ...defaultHealthProfile, ...JSON.parse(raw) } : defaultHealthProfile;
  } catch {
    return defaultHealthProfile;
  }
}

export function saveHealthProfile(profile: WomensHealthProfile, userId?: string): void {
  try {
    localStorage.setItem(getStorageKey('health_profile', userId), JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save health profile:', e);
  }
}

// Export and Wipe
export function exportAllData(userId?: string): string {
  const data = {
    exportDate: new Date().toISOString(),
    version: 'NIVA-2.0-WELLNESS',
    application: 'NIVA Menstrual Health & AI Companion',
    account: loadAccount(userId),
    preferences: loadPreferences(userId),
    cycleStats: loadCycleStats(userId),
    healthProfile: loadHealthProfile(userId),
    logs: loadDailyLogs(userId),
  };
  return JSON.stringify(data, null, 2);
}

export function clearAllLocalData(userId?: string): void {
  localStorage.removeItem(getStorageKey('account', userId));
  localStorage.removeItem(getStorageKey('prefs', userId));
  localStorage.removeItem(getStorageKey('stats', userId));
  localStorage.removeItem(getStorageKey('health_profile', userId));
  localStorage.removeItem(getStorageKey('logs', userId));
  localStorage.removeItem(getStorageKey('aichat', userId));
}
