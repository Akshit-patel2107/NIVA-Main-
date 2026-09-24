import React, { useState, useEffect } from 'react';
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
  initializeEmptyAccount,
  resetToDemoData,
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
import { DailyLogModal } from './components/DailyLogModal';
import { NivaAIChatModal } from './components/NivaAIChatModal';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { PinLockScreen } from './components/PinLockScreen';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LandingPage } from './components/LandingPage';
import { Sparkles, ShieldCheck, UserPlus, Info } from 'lucide-react';

export default function App() {
  const [account, setAccount] = useState<UserAccount>(loadAccount);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [stats, setStats] = useState<CycleStats>(loadCycleStats);
  const [logs, setLogs] = useState<Record<string, DailyLog>>(loadDailyLogs);
  const [chatHistory, setChatHistory] = useState<AIConversationMessage[]>(loadAIChatHistory);

  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [isLandingView, setIsLandingView] = useState<boolean>(false);

  // Modals
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [privacyCenterOpen, setPrivacyCenterOpen] = useState<boolean>(false);

  // Sync state to local storage on changes
  useEffect(() => {
    saveAccount(account);
  }, [account]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    saveCycleStats(stats);
  }, [stats]);

  useEffect(() => {
    saveDailyLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveAIChatHistory(chatHistory);
  }, [chatHistory]);

  const todayStr = formatDate(new Date());
  const cycleStatus = computeCycleStatus(
    stats.lastPeriodStart,
    stats.averageCycleLength,
    stats.averagePeriodLength,
    todayStr
  );

  const handleUpdatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateAccount = (updates: Partial<UserAccount>) => {
    setAccount((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateStats = (updates: Partial<CycleStats>) => {
    setStats((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDailyLog = (log: DailyLog) => {
    setLogs((prev) => {
      const updated = {
        ...prev,
        [log.date]: log,
      };

      // If marked as period start, recalculate stats
      if (log.flow && log.flow !== 'None' && log.confirmedPeriod) {
        // Can optionally auto-adjust lastPeriodStart if within reasonable window
      }

      return updated;
    });
  };

  const handleDeleteDailyLog = (dateStr: string) => {
    setLogs((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  };

  const handleWipeAllData = () => {
    clearAllLocalData();
    const cleanAccount: UserAccount = {
      id: `usr-${Date.now()}`,
      name: 'User',
      email: '',
      ageRange: '26 - 32',
      isPrivateProfile: true,
      allowAIContext: false,
      emailVerified: false,
      isAuthenticated: false,
      consentAccepted: false,
      createdAt: formatDate(new Date()),
      isDemoUser: false,
    };
    setAccount(cleanAccount);
    setLogs({});
    setChatHistory([]);
    setPrivacyCenterOpen(false);
    setIsLandingView(true);
  };

  const handleLogout = () => {
    setAccount((prev) => ({ ...prev, isAuthenticated: false }));
    setIsLandingView(true);
  };

  const handleLoginSuccess = (
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
      setStats((prev) => ({
        ...prev,
        averageCycleLength: cycleData.cycleLength,
        averagePeriodLength: cycleData.periodDuration,
        lastPeriodStart: cycleData.lastPeriod,
      }));
    }

    setIsLandingView(false);
  };

  const handleOnboardingComplete = (data: {
    lastPeriod: string;
    cycleLength: number;
    periodDuration: number;
    regularity: any;
    commonSymptoms: string[];
  }) => {
    setStats((prev) => ({
      ...prev,
      lastPeriodStart: data.lastPeriod,
      averageCycleLength: data.cycleLength,
      averagePeriodLength: data.periodDuration,
      regularity: data.regularity,
    }));
  };

  // If PIN lock is active, show the lock screen
  if (preferences.pinLockEnabled && preferences.isLocked) {
    return (
      <PinLockScreen
        correctPin={preferences.pinCode}
        onUnlock={() => handleUpdatePreferences({ isLocked: false })}
        onResetPin={() => handleUpdatePreferences({ isLocked: false, pinLockEnabled: false, pinCode: '' })}
      />
    );
  }

  // If user requested Landing Website view
  if (isLandingView) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthModalOpen(true);
          }}
          onOpenLogin={() => {
            setAuthModalOpen(true);
          }}
          onOpenAppDirectly={() => {
            setIsLandingView(false);
          }}
        />

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen pb-28 text-stone-900 bg-[#FFFDFB] ${
        preferences.appearance.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Top Demo Notification Banner (if viewing sample profile) */}
      {account.isDemoUser && (
        <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-rose-50 border-b border-rose-200/80 px-4 py-2 text-xs text-rose-950 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>
              <strong>Sample Profile Active:</strong> Viewing realistic menstrual data for Maya (Cycle Day {cycleStatus.cycleDay}).
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="font-bold underline text-rose-700 hover:text-rose-800"
            >
              Create Account
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={() => setIsLandingView(true)}
              className="text-stone-600 hover:text-stone-900 font-medium"
            >
              View Landing Page
            </button>
          </div>
        </div>
      )}

      {/* Main Top Header */}
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

      {/* Main App Container */}
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

        {/* TAB 3: Track Symptoms, Mood & Daily Wellness */}
        {currentTab === 'track' && (
          <TrackView
            logs={logs}
            onSaveLog={handleSaveDailyLog}
            preferences={preferences}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
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
          />
        )}

        {/* Supplementary View: Education Hub */}
        {currentTab === 'education' && <CycleAcademy />}
      </main>

      {/* Bottom Navigation Bar & Floating NIVA AI FAB */}
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
        onSaveChatHistory={setChatHistory}
        onClearChatHistory={() => {
          clearAIChatHistory();
          setChatHistory([]);
        }}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
