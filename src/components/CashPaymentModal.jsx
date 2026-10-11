import React, { useState } from 'react';
import { Banknote, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function CashPaymentModal({
  isOpen,
  onClose,
  cartTotal,
  onConfirmPayment,
  customer,
  onUseCashback
}) {
  const [receivedAmount, setReceivedAmount] = useState('');
  const [useBonus, setUseBonus] = useState(false);

  if (!isOpen) return null;

  const bonusAvailable = customer?.cashback || 0;
  const effectiveTotal = useBonus ? Math.max(0, cartTotal - bonusAvailable) : cartTotal;
  const receivedNum = parseFloat(receivedAmount) || 0;
  const changeAmount = Math.max(0, receivedNum - effectiveTotal);

  const quickBills = [
    { label: 'Aniq summa', amount: effectiveTotal },
    { label: '50 000', amount: 50000 },
    { label: '100 000', amount: 100000 },
    { label: '200 000', amount: 200000 },
    { label: '500 000', amount: 500000 }
  ];

  const handleComplete = () => {
    onConfirmPayment({
      paymentMethod: 'cash',
      receivedAmount: receivedNum || effectiveTotal,
      changeAmount: changeAmount,
      cashbackUsed: useBonus ? Math.min(cartTotal, bonusAvailable) : 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">Naqd Toʻlov & Qaytim</h3>
              <p className="text-[11px] text-slate-500">Sdacha hisoblagichi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Due */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl mb-4 text-center shadow-inner">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Jami toʻlov summasi
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">
            {formatMoney(effectiveTotal)}
          </div>
          {useBonus && (
            <span className="text-[10px] text-amber-300 font-bold block mt-1">
              🎁 Bonusdan chegirildi: -{formatMoney(Math.min(cartTotal, bonusAvailable))}
            </span>
          )}
        </div>

        {/* Cashback bonus option if customer attached */}
        {customer && bonusAvailable > 0 && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">
                Bonus: {formatMoney(bonusAvailable)}
              </span>
            </div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={useBonus}
                onChange={(e) => setUseBonus(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span>Yechish</span>
            </label>
          </div>
        )}

        {/* Received Input */}
        <div className="mb-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mijozdan olingan naqd pul (soʻmda):
          </label>
          <input
            type="number"
            autoFocus
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder={effectiveTotal.toString()}
            className="w-full text-center text-2xl font-black px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
          />
        </div>

        {/* Quick Kupyuralar */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {quickBills.map((bill, idx) => (
            <button
              key={idx}
              onClick={() => setReceivedAmount(bill.amount.toString())}
              className="flex-1 min-w-[68px] py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs font-black transition"
            >
              {bill.label}
            </button>
          ))}
        </div>

        {/* Change / Sdacha Display Banner */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl mb-4 text-center">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Mijozga Qaytim (Sdacha)
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">
            {formatMoney(changeAmount)}
          </div>
          {receivedNum > 0 && receivedNum < effectiveTotal && (
            <span className="text-[11px] font-black text-rose-600 block mt-0.5">
              ⚠️ {formatMoney(effectiveTotal - receivedNum)} yetmayapti!
            </span>
          )}
        </div>

        {/* Confirm */}
        <button
          onClick={handleComplete}
          disabled={receivedNum > 0 && receivedNum < effectiveTotal}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-md transition active:scale-95 disabled:opacity-40"
        >
          Savdoni yakunlash ✓
        </button>

      </div>
    </div>
  );
}
