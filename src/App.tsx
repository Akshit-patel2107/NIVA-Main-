import React, { useState, useEffect } from 'react';
import {
  auth,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
} from './firebase';
import {
  getOrCreateUserProfile,
  saveUserProfileToFirestore,
  saveDailyLogToFirestore,
  deleteDailyLogFromFirestore,
  subscribeToDailyLogs,
  saveChatHistoryToFirestore,
  loadChatHistoryFromFirestore,
  wipeUserFirestoreData,
} from './services/userService';
import {
  loadAccount,
  saveAccount,
  loadPreferences,
  savePreferences,
  loadCycleStats,
  saveCycleStats,
  loadDailyLogs,
  saveDailyLogs,
  loadAIChatHistory,
  saveAIChatHistory,
  clearAIChatHistory,
  clearAllLocalData,
  defaultAccount,
  defaultPreferences,
  defaultStats,
  defaultLogs,
  defaultAIChatHistory,
} from './utils/storage';
import {
  AIConversationMessage,
  CycleStats,
  DailyLog,
  NavigationTab,
  UserAccount,
  UserPreferences,
} from './types';
import { computeCycleStatus, formatDate } from './utils/cycleCalculations';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { TrackView } from './components/TrackView';
import { InsightsView } from './components/InsightsView';
import { ProfileView } from './components/ProfileView';
import { CycleAcademy } from './components/CycleAcademy';
import { WellnessView } from './components/WellnessView';
import { DailyLogModal } from './components/DailyLogModal';
import { NivaAIChatModal } from './components/NivaAIChatModal';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { PinLockScreen } from './components/PinLockScreen';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LandingPage } from './components/LandingPage';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // User state
  const [account, setAccount] = useState<UserAccount>(defaultAccount);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [stats, setStats] = useState<CycleStats>(defaultStats);
  const [logs, setLogs] = useState<Record<string, DailyLog>>(defaultLogs);
  const [chatHistory, setChatHistory] = useState<AIConversationMessage[]>(defaultAIChatHistory);

  // App navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [isLandingView, setIsLandingView] = useState<boolean>(false);

  // Modals
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [privacyCenterOpen, setPrivacyCenterOpen] = useState<boolean>(false);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        const { profileExists, data } = await getOrCreateUserProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName
        );

        if (data.account) {
          setAccount(data.account as UserAccount);
          saveAccount(data.account as UserAccount);
        }
        if (data.stats) {
          setStats(data.stats as CycleStats);
          saveCycleStats(data.stats as CycleStats, firebaseUser.uid);
        }
        if (data.preferences) {
          setPreferences(data.preferences as UserPreferences);
          savePreferences(data.preferences as UserPreferences, firebaseUser.uid);
        }

        // Load historical chat from Firestore
        const remoteChats = await loadChatHistoryFromFirestore(firebaseUser.uid);
        if (remoteChats && remoteChats.length > 0) {
          setChatHistory(remoteChats);
          saveAIChatHistory(remoteChats, firebaseUser.uid);
        }

        // If newly registered or onboarding not completed, open onboarding questionnaire
        if (!profileExists || !data.account?.onboardingCompleted) {
          setOnboardingOpen(true);
        }
      } else {
        setCurrentUser(null);
        setAccount(defaultAccount);
        setLogs({});
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for real-time daily logs in Firestore when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const unsubLogs = subscribeToDailyLogs(currentUser.uid, (remoteLogs) => {
      setLogs(remoteLogs);
      saveDailyLogs(remoteLogs, currentUser.uid);
    });
    return () => unsubLogs();
  }, [currentUser]);

  // Cycle calculation relative to today
  const todayStr = formatDate(new Date());
  const cycleStatus = computeCycleStatus(
    stats.lastPeriodStart,
    stats.averageCycleLength,
    stats.averagePeriodLength,
    todayStr
  );

  // Handlers for updating user data
  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    if (currentUser) {
      savePreferences(newPrefs, currentUser.uid);
      saveUserProfileToFirestore(currentUser.uid, account, stats, newPrefs);
    }
  };

  const handleUpdateAccount = (updates: Partial<UserAccount>) => {
    const newAcc = { ...account, ...updates };
    setAccount(newAcc);
    if (currentUser) {
      saveAccount(newAcc);
      saveUserProfileToFirestore(currentUser.uid, newAcc, stats, preferences);
    }
  };

  const handleUpdateStats = (updates: Partial<CycleStats>) => {
    const newStats = { ...stats, ...updates };
    setStats(newStats);
    if (currentUser) {
      saveCycleStats(newStats, currentUser.uid);
      saveUserProfileToFirestore(currentUser.uid, account, newStats, preferences);
    }
  };

  const handleSaveDailyLog = (log: DailyLog) => {
    setLogs((prev) => ({
      ...prev,
      [log.date]: log,
    }));

    if (currentUser) {
      saveDailyLogToFirestore(currentUser.uid, log);
    }
  };

  const handleDeleteDailyLog = (dateStr: string) => {
    setLogs((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });

    if (currentUser) {
      deleteDailyLogFromFirestore(currentUser.uid, dateStr);
    }
  };

  const handleSaveChatHistory = (newHistory: AIConversationMessage[]) => {
    setChatHistory(newHistory);
    if (currentUser) {
      saveChatHistoryToFirestore(currentUser.uid, newHistory);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
    if (currentUser) {
      clearAIChatHistory(currentUser.uid);
      saveChatHistoryToFirestore(currentUser.uid, []);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setAccount(defaultAccount);
      setLogs({});
      setIsLandingView(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleWipeAllData = async () => {
    if (currentUser) {
      await wipeUserFirestoreData(currentUser.uid);
      clearAllLocalData(currentUser.uid);
    }
    await signOut(auth);
    setPrivacyCenterOpen(false);
    setCurrentUser(null);
    setAccount(defaultAccount);
    setLogs({});
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    ageRange: string;
    lastPeriod: string;
    cycleLength: number;
    periodDuration: number;
    regularity: any;
    trackingPreferences: any;
  }) => {
    const updatedAccount: UserAccount = {
      ...account,
      name: data.name || account.name,
      ageRange: data.ageRange || account.ageRange,
      onboardingCompleted: true,
      trackingPreferences: data.trackingPreferences,
    };
    setAccount(updatedAccount);

    const newStats: CycleStats = {
      ...stats,
      lastPeriodStart: data.lastPeriod,
      averageCycleLength: data.cycleLength,
      averagePeriodLength: data.periodDuration,
      regularity: data.regularity,
    };
    setStats(newStats);

    if (currentUser) {
      saveAccount(updatedAccount);
      saveCycleStats(newStats, currentUser.uid);
      await saveUserProfileToFirestore(currentUser.uid, updatedAccount, newStats, preferences);
    }
  };

  const handleLoginSuccess = async (
    acc: Partial<UserAccount>,
    cycleData?: { cycleLength: number; periodDuration: number; lastPeriod: string }
  ) => {
    const updatedAccount: UserAccount = {
      ...account,
      ...acc,
      isAuthenticated: true,
    };
    setAccount(updatedAccount);

    if (cycleData) {
      const newStats: CycleStats = {
        ...stats,
        averageCycleLength: cycleData.cycleLength,
        averagePeriodLength: cycleData.periodDuration,
        lastPeriodStart: cycleData.lastPeriod,
      };
      setStats(newStats);
      if (acc.id) {
        saveCycleStats(newStats, acc.id);
        await saveUserProfileToFirestore(acc.id, updatedAccount, newStats, preferences);
      }
    }
  };

  // Loading Screen while Firebase checks authentication state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-200 animate-pulse mb-4">
          <span className="font-serif-accent font-black text-2xl">N</span>
        </div>
        <h2 className="font-serif-accent font-bold text-stone-900 text-lg">
          NIVA
        </h2>
        <p className="text-xs text-stone-500 mt-1 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Securing your private menstrual wellness session...</span>
        </p>
      </div>
    );
  }

  // COMPULSORY LOGIN GATE: User MUST sign in with Google / Gmail to access the app
  if (!currentUser) {
    return (
      <AuthModal
        isOpen={true}
        isCompulsoryGate={true}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // If user enabled PIN lock and app is locked
  if (preferences.pinLockEnabled && preferences.isLocked) {
    return (
      <PinLockScreen
        correctPin={preferences.pinCode}
        onUnlock={() => handleUpdatePreferences({ isLocked: false })}
        onResetPin={() => handleUpdatePreferences({ isLocked: false, pinLockEnabled: false, pinCode: '' })}
      />
    );
  }

  // Optional Landing Page preview for logged-in user if opened from header
  if (isLandingView) {
    return (
      <LandingPage
        onGetStarted={() => setIsLandingView(false)}
        onOpenLogin={() => setIsLandingView(false)}
        onOpenAppDirectly={() => setIsLandingView(false)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen pb-28 text-stone-900 bg-[#FFFDFB] ${
        preferences.appearance.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        preferences={preferences}
        account={account}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenEmergency={() => setEmergencyModalOpen(true)}
        onOpenPrivacyCenter={() => setPrivacyCenterOpen(true)}
        onOpenLandingPage={() => setIsLandingView(true)}
        onOpenAI={() => setAiModalOpen(true)}
      />

      {/* Main App Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TAB 1: Home Dashboard */}
        {currentTab === 'home' && (
          <DashboardView
            status={cycleStatus}
            stats={stats}
            todayLog={logs[todayStr]}
            account={account}
            preferences={preferences}
            onOpenLogModal={(date) => {
              if (date) setSelectedDate(date);
              setLogModalOpen(true);
            }}
            onOpenAI={() => setAiModalOpen(true)}
            onNavigateTab={setCurrentTab}
            onUpdateDailyLog={handleSaveDailyLog}
          />
        )}

        {/* TAB 2: Period & Cycle Calendar */}
        {currentTab === 'calendar' && (
          <CalendarView
            stats={stats}
            logs={logs}
            preferences={preferences}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenLogModal={(date) => {
              if (date) setSelectedDate(date);
              setLogModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: Track Symptoms, Mood & Body */}
        {currentTab === 'track' && (
          <TrackView
            logs={logs}
            onSaveLog={handleSaveDailyLog}
            preferences={preferences}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* TAB: Wellness Goals & Tracking */}
        {currentTab === 'wellness' && (
          <WellnessView
            logs={logs}
            todayLog={logs[todayStr]}
            onSaveLog={handleSaveDailyLog}
            preferences={preferences}
            onOpenAI={() => setAiModalOpen(true)}
          />
        )}

        {/* TAB 4: AI & Personalized Insights */}
        {currentTab === 'insights' && (
          <InsightsView
            stats={stats}
            logs={logs}
            currentPhase={cycleStatus.currentPhase}
            cycleDay={cycleStatus.cycleDay}
          />
        )}

        {/* TAB 5: Profile & Settings */}
        {currentTab === 'profile' && (
          <ProfileView
            account={account}
            stats={stats}
            preferences={preferences}
            onUpdateAccount={handleUpdateAccount}
            onUpdateStats={handleUpdateStats}
            onUpdatePreferences={handleUpdatePreferences}
            onOpenPrivacyCenter={() => setPrivacyCenterOpen(true)}
            onOpenLandingPage={() => setIsLandingView(true)}
            onLogout={handleLogout}
            onRerunOnboarding={() => setOnboardingOpen(true)}
            onClearAIHistory={handleClearChatHistory}
            onDeleteAccount={handleWipeAllData}
          />
        )}

        {/* TAB: Education Hub */}
        {currentTab === 'education' && <CycleAcademy />}
      </main>

      {/* Bottom Navigation Bar & Floating NIVA AI Button */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAI={() => setAiModalOpen(true)}
      />

      {/* Modals */}
      <DailyLogModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        dateStr={selectedDate}
        existingLog={logs[selectedDate]}
        onSaveLog={handleSaveDailyLog}
        onDeleteLog={handleDeleteDailyLog}
      />

      <NivaAIChatModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        cycleDay={cycleStatus.cycleDay}
        cycleLength={stats.averageCycleLength}
        phase={cycleStatus.currentPhase}
        todayLog={logs[todayStr]}
        stats={stats}
        chatHistory={chatHistory}
        onSaveChatHistory={handleSaveChatHistory}
        onClearChatHistory={handleClearChatHistory}
        allowCycleContext={account.allowAIContext}
        onToggleCycleContext={(allowed) => handleUpdateAccount({ allowAIContext: allowed })}
      />

      <EmergencyHelpModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        stats={stats}
        todayLog={logs[todayStr]}
        cycleDay={cycleStatus.cycleDay}
      />

      <PrivacyCenterModal
        isOpen={privacyCenterOpen}
        onClose={() => setPrivacyCenterOpen(false)}
        account={account}
        preferences={preferences}
        onUpdateAccount={handleUpdateAccount}
        onUpdatePreferences={handleUpdatePreferences}
        logsCount={Object.keys(logs).length}
        onWipeAllData={handleWipeAllData}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        userName={account.name}
      />
    </div>
  );
}
