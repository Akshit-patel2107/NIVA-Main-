import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Database,
  FileText,
  Key,
} from 'lucide-react';
import { UserAccount, UserPreferences } from '../types';
import { exportAllData, clearAllLocalData, clearAIChatHistory } from '../utils/storage';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  preferences: UserPreferences;
  onUpdateAccount: (updates: Partial<UserAccount>) => void;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  logsCount: number;
  onWipeAllData: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({
  isOpen,
  onClose,
  account,
  preferences,
  onUpdateAccount,
  onUpdatePreferences,
  logsCount,
  onWipeAllData,
}) => {
  const [exported, setExported] = useState<boolean>(false);
  const [clearedChat, setClearedChat] = useState<boolean>(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>(preferences.pinCode || '');
  const [pinEnabled, setPinEnabled] = useState<boolean>(preferences.pinLockEnabled);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `niva-health-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleClearAIChat = () => {
    clearAIChatHistory();
    setClearedChat(true);
    setTimeout(() => setClearedChat(false), 3000);
  };

  const handleSavePin = () => {
    if (pinEnabled && pinInput.length !== 4) return;
    onUpdatePreferences({
      pinLockEnabled: pinEnabled,
      pinCode: pinEnabled ? pinInput : '',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-center-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-3xl border border-stone-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="privacy-center-title" className="text-base font-bold text-stone-900">
                NIVA Privacy & Data Center
              </h3>
              <p className="text-xs text-stone-500">
                Sensitive health data protection & zero-brokering guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-stone-600">
          {/* Privacy Guarantee Statement */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl space-y-1.5 text-emerald-900">
            <div className="flex items-center space-x-2 font-bold text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Our Privacy-First Commitment</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-950/80">
              Menstrual information is highly sensitive personal data. NIVA never sells or brokers your health metrics to third-party ad networks or data aggregators. You maintain 100% ownership, access, and deletion rights at all times.
            </p>
          </div>

          {/* Stored Data Summary */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-2.5">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-stone-500" />
              <span>What Information is Stored in NIVA</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-stone-700">
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Profile Name</span>
                <span className="font-semibold text-xs">{account.name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Account Email</span>
                <span className="font-semibold text-xs truncate block">{account.email}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Daily Symptom Logs</span>
                <span className="font-semibold text-xs">{logsCount} entries recorded</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100">
                <span className="text-stone-400 text-[10px] block">Profile Visibility</span>
                <span className="font-semibold text-xs text-rose-600">
                  {account.isPrivateProfile ? 'Private (Isolated)' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions & Controls */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Privacy Permissions & Controls
            </h4>

            {/* AI Personalization Context Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="space-y-0.5 pr-3">
                <span className="font-bold text-stone-800 text-xs block">
                  Allow Cycle Data for AI Personalization
                </span>
                <p className="text-[11px] text-stone-500">
                  When enabled, NIVA AI receives only your current cycle day and recent symptoms to provide tailored hormonal advice.
                </p>
              </div>
              <input
                type="checkbox"
                checked={account.allowAIContext}
                onChange={(e) => onUpdateAccount({ allowAIContext: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            {/* Discreet Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="space-y-0.5 pr-3">
                <span className="font-bold text-stone-800 text-xs block">
                  Discreet Mode (Public Display)
                </span>
                <p className="text-[11px] text-stone-500">
                  Softens period terminology and masks sensitive cycle countdowns on the dashboard when in public spaces.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.discreetMode}
                onChange={(e) => onUpdatePreferences({ discreetMode: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            {/* PIN Lock Configuration */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-stone-800 text-xs flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-stone-600" />
                    <span>App 4-Digit PIN Lock</span>
                  </span>
                  <p className="text-[11px] text-stone-500">
                    Require a 4-digit code each time NIVA opens.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={pinEnabled}
                  onChange={(e) => {
                    setPinEnabled(e.target.checked);
                    if (!e.target.checked) {
                      onUpdatePreferences({ pinLockEnabled: false, pinCode: '' });
                    }
                  }}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </div>

              {pinEnabled && (
                <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4 digits"
                    className="w-32 px-3 py-1.5 text-center tracking-widest text-sm rounded-xl border border-stone-300 bg-white font-mono focus:outline-rose-500"
                  />
                  <button
                    onClick={handleSavePin}
                    disabled={pinInput.length !== 4}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 transition-colors"
                  >
                    Save PIN
                  </button>
                  {preferences.pinLockEnabled && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> PIN Active
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Data Management Actions */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Data Ownership & Management
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-2xs transition-colors"
              >
                {exported ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-stone-500" />}
                <span>{exported ? 'Data Exported!' : 'Export All Data (JSON)'}</span>
              </button>

              {/* Clear AI Chat */}
              <button
                onClick={handleClearAIChat}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-2xs transition-colors"
              >
                {clearedChat ? <Check className="w-4 h-4 text-emerald-600" /> : <Trash2 className="w-4 h-4 text-stone-500" />}
                <span>{clearedChat ? 'Chat History Cleared!' : 'Clear AI Chat History'}</span>
              </button>
            </div>

            {/* Permanent Account & Data Deletion */}
            <div className="pt-2">
              {!confirmDeleteAll ? (
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Permanently Delete Account & Personal Data</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-fade-in">
                  <div className="flex items-start space-x-2 text-rose-900 text-xs">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">Irreversible Action</strong>
                      <p className="mt-0.5">
                        This will permanently erase all cycle logs, account credentials, AI chats, and personal settings from this device.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onWipeAllData}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      Yes, Wipe All Data & Reset
                    </button>
                    <button
                      onClick={() => setConfirmDeleteAll(false)}
                      className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
          >
            Close Privacy Center
          </button>
        </div>
      </div>
    </div>
  );
};
