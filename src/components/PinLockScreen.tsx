import React, { useState } from 'react';
import { Lock, Unlock, Eye, Sparkles } from 'lucide-react';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  onResetPin?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  correctPin,
  onUnlock,
  onResetPin,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);

    if (next.length === 4) {
      if (next === correctPin) {
        setTimeout(onUnlock, 150);
      } else {
        setErrorShake(true);
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9F9] flex flex-col items-center justify-center p-6 text-stone-800">
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-rose-200">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold font-serif-accent text-stone-900">
            NIVA Privacy Vault
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Enter your 4-digit PIN to access your personal health data
          </p>
        </div>

        {/* PIN Dots */}
        <div
          className={`flex items-center space-x-4 my-2 transition-transform ${
            errorShake ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < enteredPin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  filled
                    ? 'bg-rose-500 border-rose-500 scale-110 shadow-xs'
                    : 'border-stone-300 bg-white'
                }`}
              />
            );
          })}
        </div>

        {errorShake && (
          <p className="text-xs font-bold text-red-600">Incorrect PIN. Please try again.</p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 text-xl font-bold text-stone-800 shadow-2xs hover:shadow-xs transition-all active:scale-95"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 text-xl font-bold text-stone-800 shadow-2xs hover:shadow-xs transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 transition-all flex items-center justify-center"
          >
            Delete
          </button>
        </div>

        {onResetPin && (
          <button
            onClick={onResetPin}
            className="text-xs text-stone-400 hover:text-rose-600 underline pt-4"
          >
            Forgot or reset PIN?
          </button>
        )}
      </div>
    </div>
  );
};
