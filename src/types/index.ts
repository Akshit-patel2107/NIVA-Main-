export type MenstrualPhase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal';

export type FlowLevel = 'None' | 'Spotting' | 'Light' | 'Medium' | 'Heavy';

export type FertilityLevel = 'Low' | 'Medium' | 'High (Fertile Window)' | 'Peak (Ovulation)';

export type RegularityStatus = 'Regular' | 'Somewhat Irregular' | 'Irregular' | 'Not sure';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  flow: FlowLevel;
  crampsLevel: number; // 0 - 5 scale
  mood: string;
  symptoms: string[];
  discharge: string;
  notes?: string;
  confirmedPeriod?: boolean; // differentiated from predicted
  overallWellbeing?: 'Great' | 'Good' | 'Okay' | 'Difficult';
  // Wellness tracking
  waterGlasses: number; // 250ml per glass
  sleepHours: number; // e.g. 7.5
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Deep';
  stressLevel: number; // 1 - 5 scale
  energyLevel: number; // 1 - 5 scale
  exerciseMinutes: number;
  exerciseType?: string;
}

export interface CycleStats {
  averageCycleLength: number; // e.g. 28
  averagePeriodLength: number; // e.g. 5
  regularity: RegularityStatus;
  lastPeriodStart: string; // YYYY-MM-DD
  pastCycles?: {
    id: string;
    startDate: string;
    endDate: string;
    cycleLength: number;
    periodDuration: number;
  }[];
}

export interface WomensHealthProfile {
  completed: boolean;
  completedAt?: string;
  lastPeriodStart: string; // YYYY-MM-DD
  averageCycleLength: number; // 21 - 45
  averagePeriodLength: number; // 2 - 10
  regularity: RegularityStatus;
  commonPhysicalSymptoms?: string[];
  commonEmotionalSymptoms?: string[];
  flowIntensity?: string;
  crampsSeverity?: string;
  clotting?: string;
  periodProducts?: string[];
  primaryGoal?: string;
  birthControl?: string;
  healthConditions?: string[];
  ageBracket?: string;
}

export interface TrackingPreferences {
  trackSymptoms: boolean;
  trackMood: boolean;
  trackWellness: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  ageRange: string;
  isPrivateProfile: boolean;
  allowAIContext: boolean;
  emailVerified: boolean;
  isAuthenticated: boolean;
  consentAccepted: boolean;
  createdAt: string;
  isDemoUser?: boolean;
  healthProfileCompleted?: boolean;
  onboardingCompleted?: boolean;
  trackingPreferences?: TrackingPreferences;
}

export interface NotificationSettings {
  periodReminder: boolean;
  daysBeforePeriod: number; // 1, 2, or 3 days
  symptomReminder: boolean;
  wellnessCheckin: boolean;
  discreteWording: boolean; // "Personal check-in" vs "Period starting"
  waterReminder: boolean;
}

export interface UserPreferences {
  discreetMode: boolean;
  pinLockEnabled: boolean;
  pinCode: string;
  isLocked: boolean;
  notifications: NotificationSettings;
  appearance: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'normal' | 'large';
  };
  language: string;
}

export interface AIInsightsData {
  hormonalStatus: string;
  energyGuidance: string;
  nutritionFocus: string[];
  comfortTip: string;
  phaseAffirmation: string;
  disclaimer: string;
}

export interface AISummaryReport {
  overview: string;
  patternObservations: string[];
  proactiveWellnessTips: string[];
  disclaimer: string;
}

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'niva';
  content: string;
  time: string;
  cycleContextIncluded?: boolean;
}

export type NavigationTab =
  | 'home'
  | 'calendar'
  | 'track'
  | 'wellness'
  | 'insights'
  | 'education'
  | 'profile'
  | 'emergency';

