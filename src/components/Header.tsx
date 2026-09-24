import React from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Settings,
  HeartPulse,
  ExternalLink,
  ShieldCheck,
  User,
} from 'lucide-react';
import { NavigationTab, UserAccount, UserPreferences } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  preferences: UserPreferences;
  account: UserAccount;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenEmergency: () => void;
  onOpenPrivacyCenter: () => void;
  onOpenLandingPage: () => void;
  onOpenAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  preferences,
  account,
  onUpdatePreferences,
  onOpenEmergency,
  onOpenPrivacyCenter,
  onOpenLandingPage,
  onOpenAI,
}) => {
  const toggleDiscreet = () => {
    onUpdatePreferences({ discreetMode: !preferences.discreetMode });
  };

  const lockApp = () => {
    if (preferences.pinLockEnabled) {
      onUpdatePreferences({ isLocked: true });
    } else {
      onOpenPrivacyCenter();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
              <span className="font-black text-lg font-serif-accent">N</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-serif-accent">
                  NIVA
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {account.isPrivateProfile ? 'Private' : 'Sync'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Menstrual Wellness & AI Companion
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Ask AI quick trigger */}
            <button
              onClick={onOpenAI}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Ask NIVA AI</span>
            </button>

            {/* Education Hub quick button */}
            <button
              onClick={() => onSelectTab('education')}
              className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'education'
                  ? 'bg-rose-100 text-rose-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title="Education Hub"
              aria-label="Education Hub"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Discreet Mode Toggle */}
            <button
              onClick={toggleDiscreet}
              title={
                preferences.discreetMode
                  ? 'Discreet Mode Active (Click to Show Full Terminology)'
                  : 'Enable Discreet Mode (Softens Period Terms in Public)'
              }
              aria-label="Toggle Discreet Mode"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                preferences.discreetMode
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 font-bold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {preferences.discreetMode ? (
                <EyeOff className="w-3.5 h-3.5 text-purple-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span className="hidden md:inline text-[11px]">
                {preferences.discreetMode ? 'Discreet' : 'Public'}
              </span>
            </button>

            {/* PIN Lock Button */}
            <button
              onClick={lockApp}
              title={preferences.pinLockEnabled ? 'Lock App Now' : 'Set Up App PIN Lock'}
              aria-label="Lock application"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* When to Seek Help (Emergency) */}
            <button
              onClick={onOpenEmergency}
              title="When to Seek Medical Care & Helplines"
              aria-label="When to Seek Medical Care"
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <HeartPulse className="w-4 h-4" />
            </button>

            {/* Landing page switch */}
            <button
              onClick={onOpenLandingPage}
              title="View NIVA Landing Website"
              aria-label="View NIVA Landing Website"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              <span>Website</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
