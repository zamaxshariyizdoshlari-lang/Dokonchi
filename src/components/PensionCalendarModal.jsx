import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Send, AlertTriangle, CheckCircle, Clock, X, ChevronRight } from 'lucide-react';
import { formatMoney, generateDebtReminderText, getTelegramShareUrl } from '../utils/storage';

export default function PensionCalendarModal({ isOpen, onClose, customers, settings }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group customers by category
  const pensionCustomers = customers.filter(
    (c) => c.category === 'pension' || (c.note && c.note.toLowerCase().includes('pensiy'))
  );
  const salaryCustomers = customers.filter(
    (c) => c.category === 'salary' || (c.note && c.note.toLowerCase().includes('oylik'))
  );
  const irregularCustomers = customers.filter(
    (c) => !pensionCustomers.includes(c) && !salaryCustomers.includes(c)
  );

  const totalPensionDebt = pensionCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalSalaryDebt = salaryCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalIrregularDebt = irregularCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const handleSendReminder = (customer) => {
    const text = generateDebtReminderText(customer, settings);
    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg m-0">
                Pensiya & Maosh Kalendari
              </h3>
              <p className="text-xs text-slate-500">
                Qarz yigʻib olish sanalari boʻyicha reja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
              👵 Pensiya oluvchilar
            </span>
            <div className="text-lg font-black text-sky-950 mt-1">
              {formatMoney(totalPensionDebt)}
            </div>
            <span className="text-[10px] text-sky-700 mt-0.5 block">
              {pensionCustomers.length} nafar mijoz
            </span>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              💼 Oylik / Maosh oluvchilar
            </span>
            <div className="text-lg font-black text-emerald-950 mt-1">
              {formatMoney(totalSalaryDebt)}
            </div>
            <span className="text-[10px] text-emerald-700 mt-0.5 block">
              {salaryCustomers.length} nafar mijoz
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          
          {/* 1. Pensiya guruhi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 m-0">
                <span>👵 Pensiya davri (Odatda oyning 10–20 sanalari)</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">
                {pensionCustomers.length} kishi
              </span>
            </div>

            <div className="space-y-2">
              {pensionCustomers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {c.name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      📅 Muddat: {c.dueDate || 'Belgilanmagan'} • {c.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-xs sm:text-sm text-amber-800">
                      {formatMoney(c.balance)}
                    </span>
                    {c.balance > 0 && (
                      <button
                        onClick={() => handleSendReminder(c)}
                        title="Telegram eslatma"
                        className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Oylik guruhi */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5 m-0">
                <span>💼 Maosh / Oylik davri (Oyning 25–5 sanalari)</span>
              </h4>
              <span className="text-xs font-bold text-slate-500">
                {salaryCustomers.length} kishi
              </span>
            </div>

            <div className="space-y-2">
              {salaryCustomers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {c.name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      📅 Muddat: {c.dueDate || 'Belgilanmagan'} • {c.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-xs sm:text-sm text-emerald-800">
                      {formatMoney(c.balance)}
                    </span>
                    {c.balance > 0 && (
                      <button
                        onClick={() => handleSendReminder(c)}
                        title="Telegram eslatma"
                        className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Close button */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Yopish
          </button>
        </div>

      </div>
    </div>
  );
}
