import React, { useState } from 'react';
import { Clock, Banknote, CreditCard, BookOpen, CheckCircle, AlertTriangle, Printer, X, ShieldAlert } from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function ShiftModal({
  isOpen,
  onClose,
  currentShift,
  transactions,
  settings,
  onOpenShift,
  onCloseShift
}) {
  const [startingCash, setStartingCash] = useState('100000');
  const [actualCash, setActualCash] = useState('');
  const [cashierName, setCashierName] = useState(settings.ownerName || 'Kassir');

  if (!isOpen) return null;

  // Compute stats for current shift
  const shiftStartTime = currentShift?.openedAt ? new Date(currentShift.openedAt).getTime() : 0;
  const shiftTxs = transactions.filter((t) => {
    // If shift is open, filter txs after open time
    if (!currentShift?.isOpen) return false;
    return true; // MVP: all today's transactions
  });

  const cashSales = shiftTxs
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);

  const cardSales = shiftTxs
    .filter((t) => t.paymentMethod === 'card')
    .reduce((sum, t) => sum + t.total, 0);

  const debtSales = shiftTxs
    .filter((t) => t.paymentMethod === 'debt')
    .reduce((sum, t) => sum + t.total, 0);

  const startCashNum = currentShift?.startingCash || 0;
  const expectedDrawerCash = startCashNum + cashSales;
  const actualCashNum = parseFloat(actualCash) || expectedDrawerCash;
  const discrepancy = actualCashNum - expectedDrawerCash;

  const handleStartShiftSubmit = (e) => {
    e.preventDefault();
    onOpenShift({
      openedAt: new Date().toISOString(),
      startingCash: parseFloat(startingCash) || 0,
      cashierName: cashierName.trim() || 'Kassir',
      isOpen: true
    });
  };

  const handleEndShiftSubmit = (e) => {
    e.preventDefault();
    onCloseShift({
      ...currentShift,
      closedAt: new Date().toISOString(),
      cashSales,
      cardSales,
      debtSales,
      expectedCash: expectedDrawerCash,
      actualCash: actualCashNum,
      discrepancy,
      isOpen: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Smena & Kassa Topshirish (Z-Hisobot)
              </h3>
              <p className="text-[11px] text-slate-500">
                {currentShift?.isOpen ? 'Smena ochiq holatda' : 'Yangi smena ochish'}
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

        {/* 1. If Shift is CLOSED: Form to open shift */}
        {!currentShift?.isOpen ? (
          <form onSubmit={handleStartShiftSubmit} className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900">
              <p className="font-bold mb-1">🌅 Yangi ish kunini / smenani boshlash</p>
              <p className="text-[11px] text-emerald-700">
                Kassani ochishdan oldin gʻaladagi dastlabki mayda pullarni kiriting.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kassir (sotuvchi) ismi:
              </label>
              <input
                type="text"
                required
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Boshlangʻich mayda pul (soʻmda):
              </label>
              <input
                type="number"
                required
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-emerald-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-md transition active:scale-95"
            >
              Smenani ochish ✓
            </button>
          </form>
        ) : (
          /* 2. If Shift is OPEN: Summary & Close Shift */
          <div className="space-y-4">
            
            {/* Shift Info */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-500">Sotuvchi:</span>
                <strong className="block text-slate-900">{currentShift.cashierName || 'Kassir'}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Boshlangʻich naqd:</span>
                <strong className="block text-slate-900">{formatMoney(startCashNum)}</strong>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Boshlangʻich mayda pul:</span>
                <strong className="font-bold">{formatMoney(startCashNum)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-emerald-700 font-bold">+ Naqd savdo tushumlari:</span>
                <strong className="text-emerald-700 font-black">+{formatMoney(cashSales)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-sky-700">Plastik karta (Humo/Uzcard):</span>
                <strong className="text-sky-700">{formatMoney(cardSales)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-amber-700">Nasiyaga berilgan qarzlar:</span>
                <strong className="text-amber-700">{formatMoney(debtSales)}</strong>
              </div>

              {/* Expected Total Cash in Drawer */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex justify-between items-baseline mt-2">
                <span className="text-xs font-bold text-slate-300">Gʻaladagi boʻlishi kerak naqd:</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatMoney(expectedDrawerCash)}
                </span>
              </div>
            </div>

            {/* Actual Cash Count form */}
            <form onSubmit={handleEndShiftSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gʻaladan sanab olingan haqiqiy naqd pul:
                </label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder={expectedDrawerCash.toString()}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-slate-900"
                />
              </div>

              {/* Discrepancy (Kamomad yoki ortiqcha) */}
              {actualCash && discrepancy !== 0 && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                  discrepancy < 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    {discrepancy < 0
                      ? `Kamomad: ${formatMoney(Math.abs(discrepancy))} kam chiqyapti!`
                      : `Ortiqcha: +${formatMoney(discrepancy)} ortiqcha chiqyapti.`}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Z-Chek chop etish</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition shadow-md active:scale-95"
                >
                  Smenani yopish ✓
                </button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
