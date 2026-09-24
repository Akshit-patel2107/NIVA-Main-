import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: Partial<UserAccount>, cycleData?: { cycleLength: number; periodDuration: number; lastPeriod: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [view, setView] = useState<
    'welcome' | 'login' | 'register' | 'consent' | 'verify' | 'forgot'
  >('welcome');

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [ageRange, setAgeRange] = useState<string>('26 - 32');
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodDuration, setPeriodDuration] = useState<number>(5);
  const [isPrivateProfile, setIsPrivateProfile] = useState<boolean>(true);

  // Verification & reset code states
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) return;
    // Advance to Privacy / Consent disclosure screen
    setView('consent');
  };

  const handleConsentAccept = () => {
    // Show email verification simulation
    setView('verify');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length < 4) {
      setVerifyError('Please enter a 4-digit code (e.g. 1234)');
      return;
    }
    // Success! Initialize account
    onLoginSuccess(
      {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        ageRange,
        isPrivateProfile,
        allowAIContext: true,
        emailVerified: true,
        isAuthenticated: true,
        consentAccepted: true,
        createdAt: new Date().toISOString().split('T')[0],
        isDemoUser: false,
      },
      {
        cycleLength,
        periodDuration,
        lastPeriod: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      }
    );
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      id: 'usr-niva-01',
      name: email.split('@')[0] || 'Maya',
      email: email || 'maya@example.com',
      ageRange: '26 - 32',
      isPrivateProfile: true,
      allowAIContext: true,
      emailVerified: true,
      isAuthenticated: true,
      consentAccepted: true,
      isDemoUser: false,
    });
    onClose();
  };

  const handleContinueWithGoogle = () => {
    onLoginSuccess({
      id: 'usr-google-demo',
      name: 'Maya Lin',
      email: 'maya.lin@gmail.com',
      ageRange: '26 - 32',
      isPrivateProfile: true,
      allowAIContext: true,
      emailVerified: true,
      isAuthenticated: true,
      consentAccepted: true,
      isDemoUser: true,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              N
            </span>
            <span className="font-extrabold text-sm text-stone-900 tracking-tight">
              NIVA
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close authentication"
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View: Welcome screen */}
        {view === 'welcome' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Welcome to NIVA
              </h2>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Smart menstrual cycle tracking, personalized hormonal insights, and empathetic AI guidance with absolute privacy.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContinueWithGoogle}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-2xs transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.67v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.16z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => setView('register')}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs shadow-xs transition-all"
              >
                Create Account with Email
              </button>

              <button
                onClick={() => setView('login')}
                className="w-full py-3 px-4 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors"
              >
                I already have an account • Log In
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-center space-x-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero third-party data selling guarantee</span>
            </div>
          </div>
        )}

        {/* View: Register Form */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center space-x-2 pb-2">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-stone-900 text-sm">
                Create Your NIVA Account
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Age Range</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                >
                  <option value="13 - 17">13 - 17</option>
                  <option value="18 - 25">18 - 25</option>
                  <option value="26 - 32">26 - 32</option>
                  <option value="33 - 39">33 - 39</option>
                  <option value="40 - 49">40 - 49</option>
                  <option value="50+">50+</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Avg Cycle (days)
                  </label>
                  <input
                    type="number"
                    min="21"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Avg Period (days)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="private-check"
                  checked={isPrivateProfile}
                  onChange={(e) => setIsPrivateProfile(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="private-check" className="text-stone-600 text-[11px] cursor-pointer">
                  Keep profile strictly private and locally isolated
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors mt-2"
            >
              Continue to Privacy Consent →
            </button>
          </form>
        )}

        {/* View: Privacy & Consent Disclosure Screen */}
        {view === 'consent' && (
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-stone-900 text-sm">
                Sensitive Health Data Consent
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Before collecting your menstrual and wellness indicators, please review how NIVA protects your sensitive personal data:
            </p>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3 text-xs text-stone-700">
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Privacy:</strong> Your menstrual records, symptoms, and moods are never sold or shared with commercial advertisers.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Ownership:</strong> You can export your entire history as a JSON file or permanently wipe your account at any time.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Voluntary AI Context:</strong> NIVA AI only uses your cycle information if you choose to enable it in the settings.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setView('register')}
                className="w-1/3 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConsentAccept}
                className="w-2/3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                I Agree & Verify Email
              </button>
            </div>
          </div>
        )}

        {/* View: Email Verification */}
        {view === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Verify Your Email Address
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                We sent a 4-digit verification code to <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={4}
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, ''));
                  setVerifyError(null);
                }}
                placeholder="1234"
                className="w-36 mx-auto px-4 py-3 text-center tracking-widest text-lg font-mono rounded-2xl border border-stone-300 bg-stone-50 text-stone-900 focus:outline-rose-500"
              />
              {verifyError && (
                <p className="text-xs text-rose-600 font-medium">{verifyError}</p>
              )}
              <p className="text-[11px] text-stone-400">
                (Demo simulator: enter any 4 numbers e.g. 1234)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Verify & Complete Registration
            </button>
          </form>
        )}

        {/* View: Login Form */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center space-x-2 pb-2">
              <button
                type="button"
                onClick={() => setView('welcome')}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-stone-900 text-sm">
                Log In to NIVA
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors mt-2"
            >
              Log In
            </button>
          </form>
        )}

        {/* View: Forgot Password */}
        {view === 'forgot' && (
          <div className="p-6 space-y-4 text-center">
            <h3 className="font-bold text-stone-900 text-base">
              Reset Your Password
            </h3>
            <p className="text-xs text-stone-500">
              Enter your email address and we'll send a password recovery link.
            </p>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-2">
                <Check className="w-5 h-5 mx-auto text-emerald-600" />
                <p className="font-semibold">Reset instructions sent!</p>
                <p className="text-[11px]">Check your inbox to create a new password.</p>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs font-bold text-emerald-700 underline pt-1 block mx-auto"
                >
                  Return to Log In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-stone-500 hover:underline block mx-auto"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
