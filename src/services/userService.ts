import {
  db,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from '../firebase';
import {
  CycleStats,
  DailyLog,
  UserAccount,
  UserPreferences,
  AIConversationMessage,
  WomensHealthProfile,
} from '../types';

export interface UserFullData {
  account: UserAccount;
  stats: CycleStats;
  preferences: UserPreferences;
  healthProfile?: WomensHealthProfile;
  logs: Record<string, DailyLog>;
  chatHistory: AIConversationMessage[];
}

/**
 * Fetch or initialize a user profile in Firestore
 */
export async function getOrCreateUserProfile(
  userId: string,
  email: string,
  displayName?: string | null
): Promise<{ profileExists: boolean; data: Partial<UserFullData> }> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      const hasHealthProfile = Boolean(data.healthProfile && data.healthProfile.completed);
      return {
        profileExists: hasHealthProfile,
        data: {
          account: {
            id: userId,
            name: data.name || displayName || email.split('@')[0],
            email: data.email || email,
            ageRange: data.ageRange || '26 - 32',
            isPrivateProfile: data.isPrivateProfile !== false,
            allowAIContext: data.allowAIContext !== false,
            emailVerified: true,
            isAuthenticated: true,
            consentAccepted: true,
            createdAt: data.createdAt || new Date().toISOString().split('T')[0],
            isDemoUser: false,
            healthProfileCompleted: hasHealthProfile,
          },
          stats: {
            averageCycleLength: data.averageCycleLength || 28,
            averagePeriodLength: data.averagePeriodLength || 5,
            regularity: data.regularity || 'Regular',
            lastPeriodStart:
              data.lastPeriodStart ||
              new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
          },
          preferences: data.preferences,
          healthProfile: data.healthProfile,
        },
      };
    } else {
      // New user! Needs onboarding questionnaire
      return {
        profileExists: false,
        data: {
          account: {
            id: userId,
            name: displayName || email.split('@')[0] || 'Friend',
            email: email,
            ageRange: '26 - 32',
            isPrivateProfile: true,
            allowAIContext: true,
            emailVerified: true,
            isAuthenticated: true,
            consentAccepted: true,
            createdAt: new Date().toISOString().split('T')[0],
            isDemoUser: false,
            healthProfileCompleted: false,
          },
        },
      };
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return {
      profileExists: false,
      data: {
        account: {
          id: userId,
          name: displayName || email.split('@')[0],
          email: email,
          ageRange: '26 - 32',
          isPrivateProfile: true,
          allowAIContext: true,
          emailVerified: true,
          isAuthenticated: true,
          consentAccepted: true,
          createdAt: new Date().toISOString().split('T')[0],
          isDemoUser: false,
          healthProfileCompleted: false,
        },
      },
    };
  }
}

/**
 * Save / Update User Profile & Cycle Settings in Firestore
 */
export async function saveUserProfileToFirestore(
  userId: string,
  account: Partial<UserAccount>,
  stats?: Partial<CycleStats>,
  preferences?: Partial<UserPreferences>,
  healthProfile?: Partial<WomensHealthProfile>
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const payload: any = {
      id: userId,
      updatedAt: new Date().toISOString(),
    };

    if (account.name) payload.name = account.name;
    if (account.email) payload.email = account.email;
    if (account.ageRange) payload.ageRange = account.ageRange;
    if (account.isPrivateProfile !== undefined) payload.isPrivateProfile = account.isPrivateProfile;
    if (account.allowAIContext !== undefined) payload.allowAIContext = account.allowAIContext;
    if (account.healthProfileCompleted !== undefined) payload.healthProfileCompleted = account.healthProfileCompleted;
    if (account.createdAt) payload.createdAt = account.createdAt;

    if (stats) {
      if (stats.averageCycleLength) payload.averageCycleLength = stats.averageCycleLength;
      if (stats.averagePeriodLength) payload.averagePeriodLength = stats.averagePeriodLength;
      if (stats.regularity) payload.regularity = stats.regularity;
      if (stats.lastPeriodStart) payload.lastPeriodStart = stats.lastPeriodStart;
    }

    if (preferences) {
      payload.preferences = preferences;
    }

    if (healthProfile) {
      payload.healthProfile = healthProfile;
    }

    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    console.error('Failed to save profile to Firestore:', error);
  }
}

/**
 * Save complete Women's Health & Menstrual Profile to Firestore
 */
export async function saveHealthProfileToFirestore(
  userId: string,
  profile: WomensHealthProfile
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        healthProfile: profile,
        averageCycleLength: profile.averageCycleLength,
        averagePeriodLength: profile.averagePeriodLength,
        regularity: profile.regularity,
        lastPeriodStart: profile.lastPeriodStart,
        ageRange: profile.ageBracket,
        healthProfileCompleted: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save health profile to Firestore:', error);
  }
}

/**
 * Save a Daily Log to Firestore
 */
export async function saveDailyLogToFirestore(
  userId: string,
  log: DailyLog
): Promise<void> {
  try {
    const logDocRef = doc(db, 'users', userId, 'dailyLogs', log.date);
    await setDoc(logDocRef, { ...log, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Failed to save daily log to Firestore:', error);
  }
}

/**
 * Delete a Daily Log from Firestore
 */
export async function deleteDailyLogFromFirestore(
  userId: string,
  dateStr: string
): Promise<void> {
  try {
    const logDocRef = doc(db, 'users', userId, 'dailyLogs', dateStr);
    await deleteDoc(logDocRef);
  } catch (error) {
    console.error('Failed to delete daily log from Firestore:', error);
  }
}

/**
 * Subscribe to all Daily Logs for a specific user
 */
export function subscribeToDailyLogs(
  userId: string,
  onLogsUpdate: (logs: Record<string, DailyLog>) => void
): () => void {
  try {
    const logsCol = collection(db, 'users', userId, 'dailyLogs');
    const unsubscribe = onSnapshot(
      logsCol,
      (snapshot) => {
        const result: Record<string, DailyLog> = {};
        snapshot.forEach((docSnap) => {
          result[docSnap.id] = docSnap.data() as DailyLog;
        });
        onLogsUpdate(result);
      },
      (error) => {
        console.warn('Daily logs snapshot error (falling back to local cache):', error);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.error('Error attaching daily logs listener:', e);
    return () => {};
  }
}

/**
 * Save user AI Chat History to Firestore
 */
export async function saveChatHistoryToFirestore(
  userId: string,
  chatHistory: AIConversationMessage[]
): Promise<void> {
  try {
    const chatDocRef = doc(db, 'users', userId, 'chats', 'primary');
    await setDoc(chatDocRef, { messages: chatHistory, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to save chat history to Firestore:', error);
  }
}

/**
 * Load user AI Chat History from Firestore
 */
export async function loadChatHistoryFromFirestore(
  userId: string
): Promise<AIConversationMessage[]> {
  try {
    const chatDocRef = doc(db, 'users', userId, 'chats', 'primary');
    const snap = await getDoc(chatDocRef);
    if (snap.exists() && snap.data().messages) {
      return snap.data().messages;
    }
  } catch (error) {
    console.warn('Failed to load chat history from Firestore:', error);
  }
  return [];
}

/**
 * Permanently delete all user records from Firestore
 */
export async function wipeUserFirestoreData(userId: string): Promise<void> {
  try {
    // 1. Delete all daily logs
    const logsCol = collection(db, 'users', userId, 'dailyLogs');
    const logSnaps = await getDocs(logsCol);
    for (const d of logSnaps.docs) {
      await deleteDoc(d.ref);
    }

    // 2. Delete chat history
    const chatDocRef = doc(db, 'users', userId, 'chats', 'primary');
    await deleteDoc(chatDocRef);

    // 3. Delete user document
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error('Failed to wipe user Firestore data:', error);
  }
}
