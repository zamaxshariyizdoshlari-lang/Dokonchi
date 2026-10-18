import React, { useState, useEffect } from 'react';
import {
  X, Check, Banknote, CreditCard, BookOpen, AlertCircle,
  Sparkles, ShieldAlert, ArrowRight, User
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function SplitPaymentModal({
  isOpen,
  onClose,
  cartTotal = 0,
  customers = [],
  initialCustomer = null,
  onConfirmSplitPayment
}) {
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [receivedCash, setReceivedCash] = useState('');
  const [allowOverlimit, setAllowOverlimit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default: 0 on all, let cashier type or choose preset
      setCashAmount('');
      setCardAmount('');
      setDebtAmount('');
      setReceivedCash('');
      setAllowOverlimit(false);
      setSelectedCustomerId(initialCustomer?.id || '');
    }
  }, [isOpen, initialCustomer, cartTotal]);

  if (!isOpen) return null;

  const cashNum = parseFloat(cashAmount) || 0;
  const cardNum = parseFloat(cardAmount) || 0;
  const debtNum = parseFloat(debtAmount) || 0;
  const totalEntered = cashNum + cardNum + debtNum;
  const diff = cartTotal - totalEntered;
  const isBalanced = Math.abs(diff) < 1;

  const receivedCashNum = parseFloat(receivedCash) || 0;
  const changeAmount = cashNum > 0 && receivedCashNum >= cashNum ? receivedCashNum - cashNum : 0;

  const selectedCust = customers.find((c) => c.id === selectedCustomerId);
  const newDebtTotal = selectedCust ? (selectedCust.balance || 0) + debtNum : 0;
  const creditLimit = selectedCust?.creditLimit || 500000;
  const isLimitExceeded = selectedCust && debtNum > 0 && newDebtTotal > creditLimit;

  // Validation
  const canSubmit =
    isBalanced &&
    totalEntered > 0 &&
    (debtNum === 0 || (selectedCust && (!isLimitExceeded || allowOverlimit)));

  // Presets
  const setExactCash = () => {
    setCashAmount(cartTotal.toString());
    setCardAmount('0');
    setDebtAmount('0');
  };

  const setExactCard = () => {
    setCashAmount('0');
    setCardAmount(cartTotal.toString());
    setDebtAmount('0');
  };

  const setHalfAndHalf = () => {
    const half = Math.round(cartTotal / 2 / 1000) * 1000;
    setCashAmount(half.toString());
    setCardAmount((cartTotal - half).toString());
    setDebtAmount('0');
  };

  const handleFillRemaining = (field) => {
    const currentOthers =
      field === 'cash' ? cardNum + debtNum : field === 'card' ? cashNum + debtNum : cashNum + cardNum;
    const remaining = Math.max(0, cartTotal - currentOthers);

    if (field === 'cash') setCashAmount(remaining.toString());
    if (field === 'card') setCardAmount(remaining.toString());
    if (field === 'debt') setDebtAmount(remaining.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    onConfirmSplitPayment({
      cashAmount: cashNum,
      cardAmount: cardNum,
      debtAmount: debtNum,
      customer: debtNum > 0 ? selectedCust : null,
      receivedAmount: receivedCashNum > 0 ? receivedCashNum : cashNum,
      changeAmount: changeAmount
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Banknote className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg m-0">
                Aralash toʻlov (Split Payment)
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Naqd + Karta + Nasiya summalarini taqsimlash
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

        {/* Total to pay banner */}
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Jami toʻlov summasi:
            </span>
            <span className="text-2xl font-black text-emerald-400">
              {formatMoney(cartTotal)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-bold block">
              Kiritildi:
            </span>
            <span className={`text-base font-black ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatMoney(totalEntered)}
            </span>
            {diff !== 0 && (
              <span className={`block text-[10px] font-extrabold ${diff > 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                {diff > 0 ? `Qoldi: ${formatMoney(diff)}` : `Ortiqcha: ${formatMoney(Math.abs(diff))}`}
              </span>
            )}
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setExactCash}
            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
          >
            Hammasi Naqd
          </button>
          <button
            type="button"
            onClick={setExactCard}
            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition"
          >
            Hammasi Karta
          </button>
          <button
            type="button"
            onClick={setHalfAndHalf}
            className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition"
          >
            50% Naqd / 50% Karta
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* 1. Cash Input */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-700" />
                1. Naqd pul qismi:
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('cash')}
                className="text-[10px] font-bold text-emerald-700 underline"
              >
                Qolganini toʻldirish
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="500"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="0 so'm"
                className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-xl text-base font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* If cash > 0, optional received & change */}
            {cashNum > 0 && (
              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-semibold">Mijoz berdi:</span>
                  <input
                    type="number"
                    min={cashNum}
                    value={receivedCash}
                    onChange={(e) => setReceivedCash(e.target.value)}
                    placeholder={cashNum.toString()}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>
                {changeAmount > 0 && (
                  <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                    Qaytim: {formatMoney(changeAmount)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 2. Card Input */}
          <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-700" />
                2. Plastik karta (Humo/Uzcard) qismi:
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('card')}
                className="text-[10px] font-bold text-sky-700 underline"
              >
                Qolganini toʻldirish
              </button>
            </div>
            
            <input
              type="number"
              min="0"
              step="500"
              value={cardAmount}
              onChange={(e) => setCardAmount(e.target.value)}
              placeholder="0 so'm"
              className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-base font-black text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* 3. Debt (Nasiya) Input */}
          <div className="p-3 bg-amber-50/60 border border-amber-300 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                3. Nasiya (Qarz daftari) qismi:
              </label>
              <button
                type="button"
                onClick={() => handleFillRemaining('debt')}
                className="text-[10px] font-bold text-amber-800 underline"
              >
                Qolganini toʻldirish
              </button>
            </div>
            
            <input
              type="number"
              min="0"
              step="500"
              value={debtAmount}
              onChange={(e) => setDebtAmount(e.target.value)}
              placeholder="0 so'm"
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-base font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {/* Customer selector when debt portion > 0 */}
            {debtNum > 0 && (
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <label className="block text-[11px] font-bold text-amber-900">
                  Nasiya yoziladigan xaridor *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Xaridorni tanlang --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatMoney(c.balance)} qarzi bor)
                    </option>
                  ))}
                </select>

                {/* Overlimit Warning */}
                {isLimitExceeded && (
                  <div className="p-2 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Qarz limiti oshib ketmoqda!
                    </p>
                    <p className="text-[10px] text-rose-700">
                      Limit: {formatMoney(creditLimit)} • Yangi qarz: {formatMoney(newDebtTotal)}
                    </p>
                    <label className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowOverlimit}
                        onChange={(e) => setAllowOverlimit(e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span>Shunga qaramay ruxsat berish</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Validation Warning */}
          {!isBalanced && totalEntered > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Summalar teng emas! Jami toʻlov: {formatMoney(cartTotal)}, kiritildi: {formatMoney(totalEntered)}.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              Aralash toʻlovni tasdiqlash ✓
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
