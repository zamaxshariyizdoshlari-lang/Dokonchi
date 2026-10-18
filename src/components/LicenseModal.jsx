import React, { useState } from 'react';
import {
  Key, ShieldCheck, CheckCircle2, Clock, AlertTriangle, X,
  Sparkles, Phone, Send, Award, Download
} from 'lucide-react';
import { exportDataBackup } from '../utils/storage';

export default function LicenseModal({
  isOpen,
  onClose,
  settings = {},
  onSaveSettings
}) {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [activationMessage, setActivationMessage] = useState('');

  if (!isOpen) return null;

  const currentLicense = settings?.license || {
    plan: 'PRO TARIF (Cheksiz)',
    status: 'active',
    key: 'BARAKA-7777-2026-VIP',
    expiresAt: '2027-12-31',
    activatedAt: '2026-01-01'
  };

  const handleActivateKey = (e) => {
    e.preventDefault();
    const key = licenseKeyInput.trim().toUpperCase();
    if (!key) return;

    if (key.startsWith('BARAKA-')) {
      const updatedLicense = {
        plan: 'PRO TARIF (Cheksiz Litsenziya)',
        status: 'active',
        key: key,
        expiresAt: '2028-12-31',
        activatedAt: new Date().toISOString().slice(0, 10)
      };

      onSaveSettings({
        ...settings,
        license: updatedLicense
      });

      setActivationMessage('✓ Litsenziya kaliti muvaffaqiyatli faollashtirildi!');
      setLicenseKeyInput('');
      setTimeout(() => setActivationMessage(''), 3000);
    } else {
      setActivationMessage('❌ Notoʻgʻri kalit! Kalit BARAKA- bilan boshlanishi kerak.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Key className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Doʻkon Litsenziyasi & Faollashtirish
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Rasmiy tijoriy litsenziya holati
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

        {/* License Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white shadow-lg border border-emerald-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Rasmiy litsenziyalangan tizim
              </span>
              <h4 className="text-lg font-black text-white mt-0.5">
                {currentLicense.plan}
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-[10px] font-black uppercase">
              {currentLicense.status === 'active' ? '✓ FAOL' : 'SINOV'}
            </span>
          </div>

          <div className="p-2.5 bg-white/10 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Litsenziya kaliti:</span>
              <span className="font-mono font-bold text-amber-300">{currentLicense.key}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Amal qilish muddati:</span>
              <span className="font-bold text-white">{currentLicense.expiresAt}</span>
            </div>
          </div>
        </div>

        {/* Enter new key */}
        <form onSubmit={handleActivateKey} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Yangi faollashtirish kalitini kiritish:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="BARAKA-XXXX-XXXX"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition active:scale-95 shadow-sm"
              >
                Faollashtirish
              </button>
            </div>
          </div>

          {activationMessage && (
            <div className={`p-2.5 rounded-xl text-xs font-bold ${
              activationMessage.includes('✓') ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {activationMessage}
            </div>
          )}
        </form>

        {/* Support & Purchase Contact */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5">
          <p className="font-bold text-slate-800">
            Litsenziyani uzaytirish yoki yangi filial ulash:
          </p>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mijozlarni qoʻllab-quvvatlash: <strong>+998 90 999 88 77</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>Rasmiy Telegram: <strong>@BarakaSavdoBot</strong></span>
          </div>
        </div>

        {/* Backup button */}
        <button
          type="button"
          onClick={exportDataBackup}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Doʻkon maʼlumotlari zaxirasini (Backup) yuklab olish</span>
        </button>

      </div>
    </div>
  );
}
