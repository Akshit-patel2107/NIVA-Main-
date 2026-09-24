import React from 'react';
import {
  Home,
  Calendar,
  Activity,
  Sparkles,
  User,
  Compass,
  Heart,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAI: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAI,
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'track', label: 'Track', icon: Activity },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'insights', label: 'Insights', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button for NIVA AI */}
      <button
        onClick={onOpenAI}
        aria-label="Ask NIVA AI"
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-40 flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/30 transition-all hover:scale-105 group"
      >
        <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span className="tracking-wide">Ask NIVA AI</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Main Bottom Navigation Bar */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-lg py-2 px-4 sm:px-6"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-rose-600 font-bold'
                    : 'text-stone-500 hover:text-stone-800 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-rose-50 scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-rose-600 absolute bottom-0" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
