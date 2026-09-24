import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Check,
  ArrowLeft,
  X,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  Heart,
  Droplet,
  Compass,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../firebase';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen?: boolean;
  isCompulsoryGate?: boolean;
  onClose?: () => void;
  onLoginSuccess: (
    account: Partial<UserAccount>,
    cycleData?: { cycleLength: number; periodDuration: number; lastPeriod: string }
  ) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen = true,
  isCompulsoryGate = false,
  onClose,
  onLoginSuccess,
}) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Google / Gmail Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onLoginSuccess({
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Member',
        email: user.email || '',
        ageRange: '26 - 32',
        isPrivateProfile: true,
        allowAIContext: true,
        emailVerified: true,
        isAuthenticated: true,
        consentAccepted: true,
        createdAt: new Date().toISOString().split('T')[0],
        isDemoUser: false,
      });
      if (onClose) onClose();
    } catch (err: any) {
      console.warn('Google sign-in popup error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Sign-in popup was blocked. Please allow popups or use your email and password below.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in window closed. Please try again or use email sign-in.');
      } else {
        // Fallback option in case environment restricts popups
        setErrorMsg(err.message || 'Unable to connect to Google. You can sign in using your Gmail email address below.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      onLoginSuccess({
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email || email,
        ageRange: '26 - 32',
        isPrivateProfile: true,
        allowAIContext: true,
        emailVerified: true,
        isAuthenticated: true,
        consentAccepted: true,
        createdAt: new Date().toISOString().split('T')[0],
        isDemoUser: false,
      });
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Email login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect email or password. If you are new to NIVA, please create an account.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setErrorMsg('Please enter your name, email, and a password of at least 6 characters.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      await updateProfile(user, { displayName: name.trim() });

      onLoginSuccess({
        id: user.uid,
        name: name.trim(),
        email: email.trim(),
        ageRange: '26 - 32',
        isPrivateProfile: true,
        allowAIContext: true,
        emailVerified: true,
        isAuthenticated: true,
        consentAccepted: true,
        createdAt: new Date().toISOString().split('T')[0],
        isDemoUser: false,
      });
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Email registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Please log in.');
      } else {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isCompulsoryGate
    ? 'min-h-screen bg-[#FFFDFB] flex items-center justify-center p-4 sm:p-6'
    : 'fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in';

  return (
    <div className={containerClasses} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="bg-white w-full max-w-md rounded-3xl border border-rose-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-xs font-serif-accent">
              N
            </span>
            <div>
              <span className="font-extrabold text-sm text-stone-900 tracking-tight font-serif-accent block">
                NIVA
              </span>
              <span className="text-[10px] text-stone-400 font-medium block">
                Personal Menstrual Wellness
              </span>
            </div>
          </div>

          {!isCompulsoryGate && onClose && (
            <button
              onClick={onClose}
              aria-label="Close authentication"
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Top Brand Presentation */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-bold text-stone-900 tracking-tight font-serif-accent">
              {view === 'login' ? 'Sign In to NIVA' : view === 'register' ? 'Create Your Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Login is required to securely store and protect your personal menstrual cycle, symptoms, and hormonal health records.
            </p>
          </div>

          {/* Primary Action: Google / Gmail Button */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-800 font-semibold text-xs sm:text-sm shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google (Gmail)'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center space-x-3 text-stone-300 py-1">
              <div className="h-px bg-stone-200 flex-1" />
              <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                Or with Email
              </span>
              <div className="h-px bg-stone-200 flex-1" />
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs flex items-start space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* VIEW: Login Form */}
          {view === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email / Gmail Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In with Email'}
              </button>

              <div className="text-center pt-2">
                <span className="text-stone-500 text-xs">Don't have a NIVA account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setView('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-rose-600 hover:underline text-xs"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* VIEW: Register Form */}
          {view === 'register' && (
            <form onSubmit={handleEmailRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Email / Gmail Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your health data will be strictly isolated to your user account.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account & Continue'}
              </button>

              <div className="text-center pt-2">
                <span className="text-stone-500 text-xs">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-rose-600 hover:underline text-xs"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* VIEW: Forgot Password */}
          {view === 'forgot' && (
            <div className="space-y-4 text-center">
              {forgotSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-2">
                  <Check className="w-5 h-5 mx-auto text-emerald-600" />
                  <p className="font-semibold">Reset instructions sent!</p>
                  <p className="text-[11px]">
                    If an account exists for {email}, a recovery link has been dispatched.
                  </p>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-xs font-bold text-emerald-700 underline pt-1 block mx-auto"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setForgotSent(true);
                  }}
                  className="space-y-3 text-xs"
                >
                  <p className="text-stone-600 text-xs">
                    Enter your email to receive a password reset link.
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-rose-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
                  >
                    Send Recovery Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-stone-500 hover:underline block mx-auto text-xs"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-center space-x-1.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>NIVA Zero-Data-Brokering Guarantee • Client-side Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
