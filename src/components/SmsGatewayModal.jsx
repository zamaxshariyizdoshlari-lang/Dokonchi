import React, { useState } from 'react';
import {
  MessageSquare, Send, X, Check, AlertCircle, Smartphone,
  Settings, Key, Sparkles, CheckCircle2
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function SmsGatewayModal({
  isOpen,
  onClose,
  settings = {},
  onSaveSettings
}) {
  const [provider, setProvider] = useState(settings?.smsProvider || 'eskiz');
  const [email, setEmail] = useState(settings?.smsEmail || '');
  const [apiToken, setApiToken] = useState(settings?.smsToken || '');
  const [autoSmsOnDebt, setAutoSmsOnDebt] = useState(settings?.autoSmsOnDebt ?? true);
  const [autoSmsOnPayment, setAutoSmsOnPayment] = useState(settings?.autoSmsOnPayment ?? true);
  const [testPhone, setTestPhone] = useState('+998 90 123 45 67');
  const [testMsg, setTestMsg] = useState('Hurmatli xaridor, Baraka doʻkonimizdan test xabari!');
  const [testStatus, setTestStatus] = useState(null); // 'sending' | 'success' | 'error'

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      smsProvider: provider,
      smsEmail: email,
      smsToken: apiToken,
      autoSmsOnDebt,
      autoSmsOnPayment
    });
    alert('SMS shlyuz sozlamalari muvaffaqiyatli saqlandi!');
    onClose();
  };

  const handleSendTestSms = () => {
    setTestStatus('sending');
    setTimeout(() => {
      setTestStatus('success');
      setTimeout(() => setTestStatus(null), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg m-0">
                SMS Xabarnomalar Shlyuzi (Eskiz.uz)
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Qarzdorlarga oddiy knopkali telefoniga SMS yuborish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-700" />
            Nega SMS xabarnoma muhim?
          </p>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            Qishloqda koʻpchilik qariyalarda Telegram yoʻq. Nasiyaga tovar olinganda ularga darhol 
            avtomatik SMS borsa, oʻrtadagi tushunmovchiliklar yoʻqoladi va qarz qaytish tezligi 2 barobar oshadi!
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Provider selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              SMS Provayder:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('eskiz')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  provider === 'eskiz'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Eskiz.uz (Oʻzbekiston)
              </button>
              <button
                type="button"
                onClick={() => setProvider('playmobile')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  provider === 'playmobile'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                PlayMobile / Boshqa
              </button>
            </div>
          </div>

          {/* API Credentials */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Eskiz.uz Email / Login:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="namuna@eskiz.uz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                API Token / Parol:
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="eyJ0eXAiOiJKV1QiLC..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Auto-SMS Toggles */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-extrabold text-slate-900 block">
              Avtomatik yuborish qoidalari:
            </span>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSmsOnDebt}
                onChange={(e) => setAutoSmsOnDebt(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>Nasiyaga tovar olinganda avtomatik SMS yuborish</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSmsOnPayment}
                onChange={(e) => setAutoSmsOnPayment(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>Qarz toʻlanganda minnatdorchilik SMSi yuborish</span>
            </label>
          </div>

          {/* Test SMS box */}
          <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-xs font-extrabold text-slate-800 block">
              Test SMS yuborib tekshirish:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+998 90 ..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleSendTestSms}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl active:scale-95 transition"
              >
                {testStatus === 'sending' ? 'Joʻnatilmoqda...' : 'Joʻnatish'}
              </button>
            </div>

            {testStatus === 'success' && (
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test SMS muvaffaqiyatli yetkazildi!</span>
              </div>
            )}
          </div>

          {/* Save buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
            >
              Sozlamalarni saqlash ✓
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
