import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Settings,
  Lock,
  Globe,
  Eye,
  HelpCircle,
  FileText,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
  Edit2,
  Key,
  Sliders,
  ExternalLink,
  Award,
  Sparkles,
  Download,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Copy,
} from 'lucide-react';
import { CycleStats, RegularityStatus, UserAccount, UserPreferences } from '../types';
import { clearAIChatHistory, exportAllData } from '../utils/storage';

interface ProfileViewProps {
  account: UserAccount;
  stats: CycleStats;
  preferences: UserPreferences;
  onUpdateAccount: (updates: Partial<UserAccount>) => void;
  onUpdateStats: (updates: Partial<CycleStats>) => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenPrivacyCenter: () => void;
  onOpenLandingPage: () => void;
  onLogout: () => void;
  onRerunOnboarding?: () => void;
  onClearAIHistory?: () => void;
  onDeleteAccount?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  account,
  stats,
  preferences,
  onUpdateAccount,
  onUpdateStats,
  onUpdatePreferences,
  onOpenPrivacyCenter,
  onOpenLandingPage,
  onLogout,
  onRerunOnboarding,
  onClearAIHistory,
  onDeleteAccount,
}) => {
  // Edit Profile Modal
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(account.name);
  const [editAge, setEditAge] = useState<string>(account.ageRange || '25–34');

  // Cycle Preferences Modal
  const [editingCycle, setEditingCycle] = useState<boolean>(false);
  const [editCycleLength, setEditCycleLength] = useState<number>(stats.averageCycleLength);
  const [editPeriodDuration, setEditPeriodDuration] = useState<number>(stats.averagePeriodLength);
  const [editRegularity, setEditRegularity] = useState<RegularityStatus>(stats.regularity || 'Regular');

  // Feedback states
  const [exportedToast, setExportedToast] = useState<boolean>(false);
  const [clearedAIToast, setClearedAIToast] = useState<boolean>(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<boolean>(false);
  const [apkGuideOpen, setApkGuideOpen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Policy modal
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  // Help modal
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const handleSaveProfile = () => {
    onUpdateAccount({
      name: editName.trim() || account.name,
      ageRange: editAge,
    });
    setEditingProfile(false);
  };

  const handleSaveCycle = () => {
    onUpdateStats({
      averageCycleLength: Number(editCycleLength) || 28,
      averagePeriodLength: Number(editPeriodDuration) || 5,
      regularity: editRegularity,
    });
    setEditingCycle(false);
  };

  const handleNotificationToggle = (
    key: keyof typeof preferences.notifications,
    value: boolean | number
  ) => {
    onUpdatePreferences({
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    });
  };

  const handleExportData = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `niva-health-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedToast(true);
    setTimeout(() => setExportedToast(false), 3000);
  };

  const handleClearAIHistory = () => {
    clearAIChatHistory(account.id);
    if (onClearAIHistory) {
      onClearAIHistory();
    }
    setClearedAIToast(true);
    setTimeout(() => setClearedAIToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast notifications */}
      {exportedToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-2 animate-fade-in">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Health records downloaded as JSON file!</span>
        </div>
      )}

      {clearedAIToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>NIVA AI chat history cleared!</span>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-rose-200">
            {account.name ? account.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {account.name || 'Your Profile'}
              </h2>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-semibold px-2 py-0.5 rounded-full">
                Encrypted Account
              </span>
            </div>
            <p className="text-xs text-stone-500">{account.email}</p>
            <p className="text-xs text-stone-400">
              Age Range: <strong className="text-stone-700">{account.ageRange || '25–34'}</strong> • Cycle:{' '}
              <strong className="text-stone-700">{stats.averageCycleLength} days</strong> ({stats.regularity || 'Regular'})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
          <button
            onClick={() => setEditingProfile(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setEditingCycle(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cycle Preferences</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              Edit Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Preferred Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Age Range (Optional)
                </label>
                <select
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                >
                  <option value="Under 18">Under 18</option>
                  <option value="18–24">18–24</option>
                  <option value="25–34">25–34</option>
                  <option value="35–44">35–44</option>
                  <option value="45+">45+</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Used only to provide age-appropriate biological insights.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CYCLE PREFERENCES MODAL */}
      {editingCycle && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              Cycle Preferences
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-stone-700">Average Cycle Length</span>
                  <span className="font-bold text-rose-600">{editCycleLength} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={editCycleLength}
                  onChange={(e) => setEditCycleLength(Number(e.target.value))}
                  className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-stone-700">Average Period Flow Duration</span>
                  <span className="font-bold text-rose-600">{editPeriodDuration} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={editPeriodDuration}
                  onChange={(e) => setEditPeriodDuration(Number(e.target.value))}
                  className="w-full accent-rose-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Cycle Regularity
                </label>
                <select
                  value={editRegularity}
                  onChange={(e) => setEditRegularity(e.target.value as RegularityStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900"
                >
                  <option value="Regular">Regular (within 1–2 days)</option>
                  <option value="Somewhat Irregular">Somewhat Irregular</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setEditingCycle(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCycle}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
              >
                Save Cycle Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: AI DATA PREFERENCES & CONTROL */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                AI Data Preferences & Privacy Control
              </h3>
              <p className="text-xs text-stone-500">
                Decide whether your historical cycle & tracking data informs NIVA AI.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-purple-950 block">
                Use cycle history to personalize NIVA AI answers
              </span>
              <span className="text-[11px] text-purple-900/80 block leading-snug">
                When enabled, NIVA AI considers your current cycle day and voluntarily logged symptoms to tailor wellness suggestions. When disabled, NIVA answers general educational questions without referencing your private logs.
              </span>
            </div>
            <input
              type="checkbox"
              checked={account.allowAIContext}
              onChange={(e) => onUpdateAccount({ allowAIContext: e.target.checked })}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer shrink-0"
            />
          </div>

          <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
            <span className="text-[11px] text-purple-800">
              Clear all saved AI conversation prompts and replies:
            </span>
            <button
              onClick={handleClearAIHistory}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-purple-300 text-purple-900 hover:bg-purple-100 transition-colors"
            >
              Clear AI History
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: NOTIFICATION SETTINGS (WITH PRIVACY-FRIENDLY WORDING) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Notification Settings
            </h3>
            <p className="text-xs text-stone-500">
              Manage reminders and lock-screen privacy phrasing.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          {/* Privacy-Friendly Notification Wording */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-xs">
                Privacy-Friendly Notification Wording
              </span>
              <input
                type="checkbox"
                checked={preferences.notifications.discreteWording}
                onChange={(e) =>
                  handleNotificationToggle('discreteWording', e.target.checked)
                }
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              When turned ON, lock-screen notifications will read: <em>"NIVA: Time for your daily personal check-in"</em> rather than mentioning periods, cramps, or flow so private health details stay confidential.
            </p>
          </div>

          {/* Period reminder */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="space-y-0.5">
              <span className="font-semibold text-stone-800 block">
                Estimated Period Reminder
              </span>
              <span className="text-[11px] text-stone-500">
                Notify 2 days before predicted start
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.periodReminder}
              onChange={(e) =>
                handleNotificationToggle('periodReminder', e.target.checked)
              }
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          {/* Daily symptom prompt */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="space-y-0.5">
              <span className="font-semibold text-stone-800 block">
                Daily Evening Wellness Check-in
              </span>
              <span className="text-[11px] text-stone-500">
                Prompt to log mood, sleep, and physical comfort
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.symptomReminder}
              onChange={(e) =>
                handleNotificationToggle('symptomReminder', e.target.checked)
              }
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>

          {/* Hydration reminder */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div className="space-y-0.5">
              <span className="font-semibold text-stone-800 block">
                Daytime Hydration Nudges
              </span>
              <span className="text-[11px] text-stone-500">
                Remind to drink water across your work day
              </span>
            </div>
            <input
              type="checkbox"
              checked={preferences.notifications.waterReminder}
              onChange={(e) =>
                handleNotificationToggle('waterReminder', e.target.checked)
              }
              className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: PRIVACY CENTER & DATA MANAGEMENT */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Privacy Center & Data Management
            </h3>
            <p className="text-xs text-stone-500">
              Full control over export, PIN protection, and account deletion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={onOpenPrivacyCenter}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-stone-900 block">Privacy Center</span>
                <span className="text-[11px] text-stone-500">PIN Lock & data guarantees</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-4 h-4 text-rose-600" />
              <div>
                <span className="font-bold text-stone-900 block">Export All Data</span>
                <span className="text-[11px] text-stone-500">Download complete JSON records</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>

          <button
            onClick={() => setApkGuideOpen(true)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200 text-left transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <div>
                <span className="font-bold text-teal-900 block">Download APK / Install App</span>
                <span className="text-[11px] text-teal-700">Android WebAPK & standalone APK</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-teal-400" />
          </button>

          {onRerunOnboarding && (
            <button
              onClick={onRerunOnboarding}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-left transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="font-bold text-stone-900 block">Re-run Onboarding</span>
                  <span className="text-[11px] text-stone-500">Recalibrate welcome questionnaire</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          )}

          <button
            onClick={() => setConfirmDeleteModal(true)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200 text-left transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <div>
                <span className="font-bold text-rose-900 block">Delete Account & Data</span>
                <span className="text-[11px] text-rose-700">Permanently erase health profile</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* SECTION 4: HELP, TERMS & PRIVACY POLICY */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Resources & Legal
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 font-semibold text-stone-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-stone-500" />
            <span>Help & Support</span>
          </button>

          <button
            onClick={() => setPolicyType('privacy')}
            className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 font-semibold text-stone-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-stone-500" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setPolicyType('terms')}
            className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 font-semibold text-stone-700 transition-colors"
          >
            <Award className="w-4 h-4 text-stone-500" />
            <span>Terms of Service</span>
          </button>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of NIVA</span>
          </button>

          <span className="text-[11px] text-stone-400">
            NIVA Wellness v2.0 • Digital Health Companion
          </span>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                Permanently Delete Your Account?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This will delete your cloud user profile, cycle history, and all daily symptom logs from Firestore. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setConfirmDeleteModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDeleteModal(false);
                  if (onDeleteAccount) onDeleteAccount();
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT MODAL */}
      {helpOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-3xl p-6 border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-stone-900 mb-3 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <span>NIVA Help & Support</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-stone-600 pr-1">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                <span className="font-bold text-stone-900 block">How are next period dates estimated?</span>
                <p>NIVA calculates predictions based on your last period start date and your average cycle length. These are estimates intended for personal planning, not guarantees or contraceptive advice.</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                <span className="font-bold text-stone-900 block">How does NIVA AI use my data?</span>
                <p>NIVA AI only accesses cycle context if you voluntarily allow it in AI Data Preferences. Your private health data is never sold to advertising brokers.</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1">
                <span className="font-bold text-stone-900 block">When should I consult a doctor?</span>
                <p>If you experience debilitating cramps, bleeding through pads/tampons every hour for 2+ consecutive hours, sudden high fever with tampon use, or periods absent for over 90 days, please consult a qualified healthcare provider immediately.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Help
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POLICY MODAL */}
      {policyType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-xl max-h-[80vh] rounded-3xl p-6 border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-stone-900 mb-2">
              {policyType === 'privacy' ? 'NIVA Privacy Policy' : 'NIVA Terms of Service'}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-stone-600 leading-relaxed pr-1">
              {policyType === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Sensitive Health Information Protection:</strong> At NIVA, your menstrual, fertility, and wellness data is treated as sensitive personal data. We never sell, rent, or trade your identifiable health logs.
                  </p>
                  <p>
                    <strong>2. User-Authorized AI Processing:</strong> When you converse with NIVA AI, only voluntarily shared cycle indicators are processed through secure server-side proxies. You have full granular control to disable cycle data sharing in AI Data Preferences.
                  </p>
                  <p>
                    <strong>3. Data Portability and Deletion:</strong> You have the absolute right to export all recorded logs in structured JSON format or permanently purge your account and all associated data at any time.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Educational & Wellness Scope:</strong> NIVA is designed strictly as a menstrual wellness tracking and educational platform. NIVA AI does not provide medical diagnoses, clinical prescriptions, or emergency triage services.
                  </p>
                  <p>
                    <strong>2. Medical Disclaimer:</strong> Users should always consult qualified healthcare providers for medical conditions, severe pain, or abnormal bleeding.
                  </p>
                  <p>
                    <strong>3. User Integrity:</strong> By creating a NIVA account, you agree to maintain accurate personal wellness records and protect your credentials.
                  </p>
                </>
              )}
            </div>
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setPolicyType(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APK & PWA INSTALL GUIDE MODAL */}
      {apkGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-xl max-h-[88vh] rounded-3xl p-6 border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    How to Install NIVA & Download APK
                  </h3>
                  <p className="text-xs text-stone-500">
                    Native Android installation options
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApkGuideOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 text-xs text-stone-700 leading-relaxed pr-1">
              {/* Option 1: Instant Native Android WebAPK (Easiest) */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-sm text-teal-950">
                    Method 1: Direct Android Install (WebAPK — Recommended)
                  </span>
                </div>
                <p className="text-teal-900 text-xs">
                  Android devices automatically compile and install NIVA as a native <strong>WebAPK</strong> without needing manual file downloads:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-teal-950 pl-1">
                  <li>Open NIVA in <strong>Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</li>
                  <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Android will generate an official app icon in your app drawer that opens in full-screen standalone mode!</li>
                </ol>
              </div>

              {/* Option 2: Generate Standalone .APK File */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-white font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-sm text-stone-900">
                    Method 2: Download Standalone .APK / .AAB File
                  </span>
                </div>
                <p className="text-stone-600 text-xs">
                  If you need a standalone <code>.apk</code> file to sideload or submit to the Google Play Store:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-stone-700 pl-1">
                  <li>
                    Visit <strong><a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-rose-600 underline font-semibold">PWABuilder.com</a></strong> (free official tool by Microsoft).
                  </li>
                  <li>Paste your live NIVA web app URL.</li>
                  <li>Click <strong>"Package for Stores"</strong> and choose <strong>Android</strong>.</li>
                  <li>Click <strong>Generate APK / AAB</strong> to download your signed APK file directly to your computer or phone!</li>
                </ol>
              </div>

              {/* Live URL Helper */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                  Your Live App URL for APK Generation:
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin}
                    className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 font-mono select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      setCopiedToast(true);
                      setTimeout(() => setCopiedToast(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 flex items-center space-x-1 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToast ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setApkGuideOpen(false)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
