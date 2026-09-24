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
} from 'lucide-react';
import { CycleStats, UserAccount, UserPreferences } from '../types';

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
}) => {
  // Edit Profile State
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(account.name);
  const [editAge, setEditAge] = useState<string>(account.ageRange);
  const [editCycleLength, setEditCycleLength] = useState<number>(stats.averageCycleLength);
  const [editPeriodDuration, setEditPeriodDuration] = useState<number>(stats.averagePeriodLength);

  // Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);
  const [currentPw, setCurrentPw] = useState<string>('');
  const [newPw, setNewPw] = useState<string>('');
  const [pwSuccess, setPwSuccess] = useState<boolean>(false);

  // Policy modal state
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  // Help modal state
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const handleSaveProfile = () => {
    onUpdateAccount({
      name: editName.trim() || account.name,
      ageRange: editAge,
    });
    onUpdateStats({
      averageCycleLength: Number(editCycleLength) || 28,
      averagePeriodLength: Number(editPeriodDuration) || 5,
    });
    setEditingProfile(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) return;
    setPwSuccess(true);
    setTimeout(() => {
      setPwSuccess(false);
      setPasswordModalOpen(false);
      setCurrentPw('');
      setNewPw('');
    }, 2000);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-rose-200">
            {account.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {account.name}
              </h2>
              {account.isPrivateProfile && (
                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-semibold px-2 py-0.5 rounded-full">
                  Private Profile
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">{account.email}</p>
            <p className="text-xs text-stone-400">
              Age Range: <strong className="text-stone-700">{account.ageRange}</strong> • Avg Cycle:{' '}
              <strong className="text-stone-700">{stats.averageCycleLength} days</strong>
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
            onClick={onOpenPrivacyCenter}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Privacy Center</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {editingProfile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 id="edit-profile-title" className="text-base font-bold text-stone-900">
              Edit Account & Cycle Settings
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Age Range</label>
                <select
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                >
                  <option value="13 - 17">13 - 17 (Teen)</option>
                  <option value="18 - 25">18 - 25</option>
                  <option value="26 - 32">26 - 32</option>
                  <option value="33 - 39">33 - 39</option>
                  <option value="40 - 49">40 - 49 (Perimenopause)</option>
                  <option value="50+">50+ (Menopause)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={editCycleLength}
                    onChange={(e) => setEditCycleLength(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Period Duration (days)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={editPeriodDuration}
                    onChange={(e) => setEditPeriodDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 id="change-password-title" className="text-base font-bold text-stone-900">
              Change Account Password
            </h3>

            {pwSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section: Smart Reminders & Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900">
              Smart Reminders & Notifications
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            Control automated notifications and choose privacy-friendly wording for lock screens.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            {/* Predicted Period Reminder */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="font-semibold text-stone-800 block">
                  Upcoming Period Reminder
                </span>
                <span className="text-[11px] text-stone-500">
                  Notify {preferences.notifications.daysBeforePeriod} days before predicted start
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

            {/* Privacy Notification Wording */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5 pr-2">
                <span className="font-semibold text-stone-800 block">
                  Privacy-Friendly Notification Wording
                </span>
                <span className="text-[11px] text-stone-500">
                  Displays "NIVA: Time for personal check-in" instead of sensitive period words.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifications.discreteWording}
                onChange={(e) =>
                  handleNotificationToggle('discreteWording', e.target.checked)
                }
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            {/* Daily Symptom Logging Prompt */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="font-semibold text-stone-800 block">
                  Evening Symptom Prompt
                </span>
                <span className="text-[11px] text-stone-500">
                  Quick reminder to note mood and symptoms
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

            {/* Water reminder */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="space-y-0.5">
                <span className="font-semibold text-stone-800 block">
                  Hydration Reminders
                </span>
                <span className="text-[11px] text-stone-500">
                  Gentle nudges to drink water across the day
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

        {/* Section: Security & Accessibility */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Security & Preferences
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-left transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-stone-500" />
                <span className="font-semibold text-stone-800">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={onOpenPrivacyCenter}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/70 text-left transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-stone-500" />
                <span className="font-semibold text-stone-800">Privacy Center & Data Export</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Language Selector */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-stone-500" />
                <span className="font-semibold text-stone-800">Language</span>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => onUpdatePreferences({ language: e.target.value })}
                className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-700"
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>

            {/* Accessibility: High contrast */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <span className="font-semibold text-stone-800">High Contrast Text</span>
              <input
                type="checkbox"
                checked={preferences.appearance.highContrast}
                onChange={(e) =>
                  onUpdatePreferences({
                    appearance: {
                      ...preferences.appearance,
                      highContrast: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            {/* Accessibility: Reduced Motion */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <span className="font-semibold text-stone-800">Reduced Motion</span>
              <input
                type="checkbox"
                checked={preferences.appearance.reducedMotion}
                onChange={(e) =>
                  onUpdatePreferences({
                    appearance: {
                      ...preferences.appearance,
                      reducedMotion: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links: Landing Page, Help, Legal */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Resources & Legal
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <button
            onClick={onOpenLandingPage}
            className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 font-semibold text-stone-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <span>View NIVA Landing Website</span>
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
            <span>Sign Out of Account</span>
          </button>

          <span className="text-[11px] text-stone-400">
            NIVA Wellness v2.0 • Digital Health Companion
          </span>
        </div>
      </div>

      {/* Policy Modal */}
      {policyType && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white w-full max-w-xl max-h-[80vh] rounded-3xl p-6 border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
            <h3 id="legal-modal-title" className="text-base font-bold text-stone-900 mb-2">
              {policyType === 'privacy' ? 'NIVA Privacy Policy' : 'NIVA Terms of Service'}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-stone-600 leading-relaxed pr-1">
              {policyType === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Sensitive Health Information Protection:</strong> At NIVA, your menstrual, fertility, and wellness data is treated as sensitive personal data. We never sell, rent, or trade your identifiable health logs.
                  </p>
                  <p>
                    <strong>2. User-Authorized AI Processing:</strong> When you converse with NIVA AI, only voluntarily shared cycle indicators are processed through secure server-side proxies. You have full granular control to disable cycle data sharing in the Privacy Center.
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
    </div>
  );
};
