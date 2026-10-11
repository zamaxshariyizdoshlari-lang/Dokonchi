import React, { useState } from 'react';
import { Lock, X, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminPinModal({ isOpen, onClose, onSuccess, currentPin = '7777' }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleDeleteLast = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const verifyPin = (enteredPin) => {
    if (enteredPin === currentPin) {
      setTimeout(() => {
        onSuccess();
        setPin('');
        onClose();
      }, 200);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm m-0">Admin Kirish</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mb-4 font-medium">
          Doʻkon egasi xavfsizlik PIN-kodini kiriting
        </p>

        {/* PIN Dots Display */}
        <div className={`flex justify-center gap-3 mb-6 ${error ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > idx
                  ? error
                    ? 'bg-rose-500 border-rose-500 scale-110'
                    : 'bg-emerald-600 border-emerald-600 scale-110'
                  : 'bg-slate-100 border-slate-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-rose-600 font-extrabold text-xs mb-3 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> PIN-kod notoʻgʻri!
          </p>
        )}

        {/* Numpad Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-4 select-none">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-lg active:scale-95 shadow-xs border border-slate-200 transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 active:scale-95 transition"
          >
            C
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-lg active:scale-95 shadow-xs border border-slate-200 transition"
          >
            0
          </button>
          <button
            onClick={handleDeleteLast}
            className="h-12 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 active:scale-95 transition"
          >
            ⌫
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Standart doʻkondor PIN: <strong className="text-slate-700">7777</strong>
        </p>

      </div>
    </div>
  );
}
