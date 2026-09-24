import {
  CycleStats,
  DailyLog,
  UserAccount,
  UserPreferences,
  AIConversationMessage,
} from '../types';
import { addDays, formatDate } from './cycleCalculations';

const STORAGE_KEYS = {
  ACCOUNT: 'niva_user_account',
  PREFS: 'niva_user_preferences',
  STATS: 'niva_cycle_stats',
  LOGS: 'niva_daily_logs',
  AI_CHAT: 'niva_ai_chat_history',
};

// Compute dynamic reference dates relative to today
const today = new Date();
const todayStr = formatDate(today);
// Day 13 as realistic demo starting point
const defaultLastPeriodStart = addDays(todayStr, -12);

export const defaultAccount: UserAccount = {
  id: 'usr-niva-01',
  name: 'Maya Lin',
  email: 'maya@example.com',
  ageRange: '26 - 32',
  isPrivateProfile: true,
  allowAIContext: true,
  emailVerified: true,
  isAuthenticated: true,
  consentAccepted: true,
  createdAt: '2026-06-15',
  isDemoUser: true,
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
  pastCycles: [
    {
      id: 'cyc-1',
      startDate: addDays(defaultLastPeriodStart, -28),
      endDate: addDays(defaultLastPeriodStart, -1),
      cycleLength: 28,
      periodDuration: 5,
    },
    {
      id: 'cyc-2',
      startDate: addDays(defaultLastPeriodStart, -57),
      endDate: addDays(defaultLastPeriodStart, -29),
      cycleLength: 29,
      periodDuration: 5,
    },
    {
      id: 'cyc-3',
      startDate: addDays(defaultLastPeriodStart, -85),
      endDate: addDays(defaultLastPeriodStart, -58),
      cycleLength: 28,
      periodDuration: 4,
    },
  ],
};

export const defaultLogs: Record<string, DailyLog> = {
  [defaultLastPeriodStart]: {
    date: defaultLastPeriodStart,
    flow: 'Medium',
    crampsLevel: 3,
    mood: 'Sensitive',
    symptoms: ['Bloating', 'Back Pain', 'Cramps'],
    discharge: 'None',
    notes: 'Period began this morning. Warm heat compress helped cramps immensely.',
    confirmedPeriod: true,
    waterGlasses: 7,
    sleepHours: 7.0,
    sleepQuality: 'Fair',
    stressLevel: 3,
    energyLevel: 2,
    exerciseMinutes: 15,
    exerciseType: 'Gentle walking',
  },
  [addDays(defaultLastPeriodStart, 1)]: {
    date: addDays(defaultLastPeriodStart, 1),
    flow: 'Heavy',
    crampsLevel: 4,
    mood: 'Tired',
    symptoms: ['Bloating', 'Headache', 'Cramps', 'Fatigue'],
    discharge: 'None',
    notes: 'Heaviest day. Stayed hydrated with chamomile and ginger tea.',
    confirmedPeriod: true,
    waterGlasses: 8,
    sleepHours: 8.5,
    sleepQuality: 'Good',
    stressLevel: 3,
    energyLevel: 1,
    exerciseMinutes: 0,
    exerciseType: 'Rest day',
  },
  [addDays(defaultLastPeriodStart, 2)]: {
    date: addDays(defaultLastPeriodStart, 2),
    flow: 'Medium',
    crampsLevel: 2,
    mood: 'Calm',
    symptoms: ['Bloating', 'Mild Cramps'],
    discharge: 'None',
    notes: 'Pain noticeably subsiding. Energy returning.',
    confirmedPeriod: true,
    waterGlasses: 8,
    sleepHours: 7.5,
    sleepQuality: 'Good',
    stressLevel: 2,
    energyLevel: 3,
    exerciseMinutes: 20,
    exerciseType: 'Slow stretching',
  },
  [addDays(defaultLastPeriodStart, 3)]: {
    date: addDays(defaultLastPeriodStart, 3),
    flow: 'Light',
    crampsLevel: 1,
    mood: 'Happy',
    symptoms: ['Breast Tenderness'],
    discharge: 'None',
    notes: 'Light flow, feeling peaceful.',
    confirmedPeriod: true,
    waterGlasses: 7,
    sleepHours: 8.0,
    sleepQuality: 'Deep',
    stressLevel: 1,
    energyLevel: 4,
    exerciseMinutes: 30,
    exerciseType: 'Pilates',
  },
  [addDays(defaultLastPeriodStart, 4)]: {
    date: addDays(defaultLastPeriodStart, 4),
    flow: 'Spotting',
    crampsLevel: 0,
    mood: 'Energetic',
    symptoms: [],
    discharge: 'Dry',
    notes: 'Final day of flow. Ready for follicular rise!',
    confirmedPeriod: true,
    waterGlasses: 8,
    sleepHours: 7.8,
    sleepQuality: 'Deep',
    stressLevel: 1,
    energyLevel: 4,
    exerciseMinutes: 40,
    exerciseType: 'Brisk walk & bodyweight',
  },
  [todayStr]: {
    date: todayStr,
    flow: 'None',
    crampsLevel: 0,
    mood: 'Energetic',
    symptoms: [],
    discharge: 'Clear / Stretchy',
    notes: 'Ovulation approaching. Clear mental clarity and high stamina.',
    confirmedPeriod: false,
    waterGlasses: 6,
    sleepHours: 7.6,
    sleepQuality: 'Deep',
    stressLevel: 2,
    energyLevel: 5,
    exerciseMinutes: 45,
    exerciseType: 'Strength training',
  },
};

export const defaultAIChatHistory: AIConversationMessage[] = [
  {
    id: 'msg-01',
    role: 'niva',
    content:
      'Welcome to NIVA AI. I am your certified menstrual health and cycle wellness companion. Feel free to ask about your hormonal phases, cramp soothing rituals, nutrition, sleep, or when symptoms warrant clinical evaluation. How can I support your wellbeing today?',
    time: 'Yesterday',
  },
];

// Account
export function loadAccount(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
    return raw ? { ...defaultAccount, ...JSON.parse(raw) } : defaultAccount;
  } catch {
    return defaultAccount;
  }
}

export function saveAccount(account: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save account:', e);
  }
}

// Preferences
export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

// Cycle stats
export function loadCycleStats(): CycleStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export function saveCycleStats(stats: CycleStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save cycle stats:', e);
  }
}

// Daily Logs
export function loadDailyLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? { ...defaultLogs, ...JSON.parse(raw) } : defaultLogs;
  } catch {
    return defaultLogs;
  }
}

export function saveDailyLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save daily logs:', e);
  }
}

// AI Chat history
export function loadAIChatHistory(): AIConversationMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_CHAT);
    return raw ? JSON.parse(raw) : defaultAIChatHistory;
  } catch {
    return defaultAIChatHistory;
  }
}

export function saveAIChatHistory(history: AIConversationMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_CHAT, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save AI chat history:', e);
  }
}

export function clearAIChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
  } catch (e) {
    console.error('Failed to clear AI chat:', e);
  }
}

// Export and Wipe
export function exportAllData(): string {
  const data = {
    exportDate: new Date().toISOString(),
    version: 'NIVA-2.0-WELLNESS',
    application: 'NIVA Menstrual Health & AI Companion',
    account: loadAccount(),
    preferences: loadPreferences(),
    cycleStats: loadCycleStats(),
    logs: loadDailyLogs(),
    aiConversationsCount: loadAIChatHistory().length,
  };
  return JSON.stringify(data, null, 2);
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
  localStorage.removeItem(STORAGE_KEYS.PREFS);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.AI_CHAT);
}

export function resetToDemoData(): void {
  saveAccount(defaultAccount);
  savePreferences(defaultPreferences);
  saveCycleStats(defaultStats);
  saveDailyLogs(defaultLogs);
  saveAIChatHistory(defaultAIChatHistory);
}

export function initializeEmptyAccount(name: string, email: string, ageRange: string, cycleLength: number, periodDuration: number, lastPeriod: string): void {
  const newAccount: UserAccount = {
    id: `usr-${Date.now()}`,
    name,
    email,
    ageRange,
    isPrivateProfile: true,
    allowAIContext: true,
    emailVerified: true,
    isAuthenticated: true,
    consentAccepted: true,
    createdAt: formatDate(new Date()),
    isDemoUser: false,
  };

  const newStats: CycleStats = {
    averageCycleLength: cycleLength,
    averagePeriodLength: periodDuration,
    regularity: 'Regular',
    lastPeriodStart: lastPeriod,
    pastCycles: [],
  };

  saveAccount(newAccount);
  savePreferences({ ...defaultPreferences, discreetMode: false });
  saveCycleStats(newStats);
  saveDailyLogs({});
  saveAIChatHistory([
    {
      id: 'msg-welcome',
      role: 'niva',
      content: `Welcome to NIVA, ${name}! Your cycle tracker is set up with an average ${cycleLength}-day cycle and ${periodDuration}-day period duration. I am here whenever you have questions about your symptoms, hormones, or wellness.`,
      time: 'Just now',
    },
  ]);
}
