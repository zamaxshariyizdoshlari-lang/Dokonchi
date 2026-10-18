import React, { useState } from 'react';
import {
  Calendar, CheckCircle2, Clock, Plus, Trash2, Send, Printer,
  X, AlertTriangle, ChevronRight, Check, DollarSign, Sparkles
} from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function InstallmentsModal({
  isOpen,
  onClose,
  customer,
  settings,
  onUpdateCustomer,
  onRecordPayment
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  
  // New installment form state
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [downPayment, setDownPayment] = useState('0');
  const [monthsCount, setMonthsCount] = useState(3);
  const [firstPaymentDate, setFirstPaymentDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(10); // Default to 10th of next month (village pension/salary date)
    return d.toISOString().slice(0, 10);
  });

  if (!isOpen || !customer) return null;

  const plans = customer.installmentPlans || [];
  const shopName = settings?.shopName || 'Baraka Baqqollik Doʻkoni';

  // Handle Create New Plan
  const handleCreatePlan = (e) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    const initial = parseFloat(downPayment) || 0;

    if (!total || isNaN(total) || total <= 0) {
      alert('Iltimos, umumiy summani toʻgʻri kiriting');
      return;
    }

    if (initial >= total) {
      alert('Boshlangʻich toʻlov umumiy summadan kam boʻlishi kerak');
      return;
    }

    const remainingToSplit = total - initial;
    const monthlySum = Math.round(remainingToSplit / monthsCount);

    // Generate month installments
    const schedule = [];
    const baseDate = new Date(firstPaymentDate);

    for (let i = 0; i < monthsCount; i++) {
      const monthDate = new Date(baseDate);
      monthDate.setMonth(baseDate.getMonth() + i);

      schedule.push({
        monthNumber: i + 1,
        dueDate: monthDate.toISOString().slice(0, 10),
        amount: monthlySum,
        status: 'pending', // 'pending' | 'paid'
        paidDate: null
      });
    }

    const newPlan = {
      id: `plan-${Date.now()}`,
      title: title.trim() || 'Boʻlib toʻlash (Rassrochka)',
      createdAt: new Date().toISOString().slice(0, 10),
      totalAmount: total,
      downPayment: initial,
      remainingAmount: remainingToSplit,
      monthsCount,
      schedule
    };

    // If down payment made, optionally record it
    if (initial > 0) {
      onRecordPayment(customer.id, initial, `${newPlan.title} (Boshlangʻich toʻlov)`);
    }

    // Add to customer's balance the remaining debt
    const updatedPlans = [newPlan, ...plans];
    const newBal = (customer.balance || 0) + remainingToSplit;

    onUpdateCustomer({
      ...customer,
      balance: newBal,
      installmentPlans: updatedPlans
    });

    // Reset & switch to list
    setTitle('');
    setTotalAmount('');
    setDownPayment('0');
    setMonthsCount(3);
    setActiveTab('list');
  };

  // Mark installment month as paid
  const handlePayInstallmentMonth = (planId, monthNumber, amount) => {
    const today = new Date().toISOString().slice(0, 10);

    const updatedPlans = plans.map((plan) => {
      if (plan.id === planId) {
        const updatedSchedule = plan.schedule.map((item) => {
          if (item.monthNumber === monthNumber) {
            return { ...item, status: 'paid', paidDate: today };
          }
          return item;
        });

        const newRemaining = Math.max(0, plan.remainingAmount - amount);
        return {
          ...plan,
          remainingAmount: newRemaining,
          schedule: updatedSchedule
        };
      }
      return plan;
    });

    // Record debt payment
    onRecordPayment(customer.id, amount, `${monthNumber}-oylik boʻlib toʻlash (Rassrochka) toʻlovi`);

    onUpdateCustomer({
      ...customer,
      installmentPlans: updatedPlans
    });
  };

  // Delete a completed or cancelled plan
  const handleDeletePlan = (planId) => {
    if (!confirm('Haqiqatan ham ushbu grafikni oʻchirmoqchimisiz?')) return;
    const updatedPlans = plans.filter((p) => p.id !== planId);
    onUpdateCustomer({
      ...customer,
      installmentPlans: updatedPlans
    });
  };

  // Share schedule to Telegram
  const handleShareTelegram = (plan) => {
    let text = `📅 BOʻLIB TOʻLASH GRAFIGI (RASSROCHKA)\n`;
    text += `Hurmatli: ${customer.name}\n`;
    text += `Tovar: ${plan.title}\n`;
    text += `Jami summa: ${formatMoney(plan.totalAmount)}\n`;
    if (plan.downPayment > 0) {
      text += `Boshlang'ich to'langan: ${formatMoney(plan.downPayment)}\n`;
    }
    text += `Qolgan to'lov: ${formatMoney(plan.remainingAmount)}\n`;
    text += `------------------------------------\n`;
    text += `TO'LOV OYLIK JADVALI:\n`;

    plan.schedule.forEach((s) => {
      const statusIcon = s.status === 'paid' ? '✓ TOʻLANDI' : '⏳ KUTILMOQDA';
      text += `${s.monthNumber}-oy: ${s.dueDate} | ${formatMoney(s.amount)} [${statusIcon}]\n`;
    });

    text += `------------------------------------\n`;
    text += `Do'kon: ${shopName}\n`;
    text += `Barakangizni bersin!`;

    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg m-0">
                Boʻlib toʻlash (Rassrochka) grafigi
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Mijoz: <strong className="text-slate-800">{customer.name}</strong> • Qarz: <strong className="text-amber-700">{formatMoney(customer.balance)}</strong>
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

        {/* Tab switch */}
        <div className="flex gap-2 my-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Mavjud grafiklar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-200">
              {plans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Yangi grafik ochish</span>
          </button>
        </div>

        {/* TAB 1: LIST ACTIVE PLANS */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 mb-1">
                  Ushbu xaridor uchun boʻlib toʻlash grafigi yoʻq
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Katta xaridlar (un, yem, koʻmir yoki marosim xarajatlari) uchun oylik grafik yarating.
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition"
                >
                  + Yangi grafik tuzish
                </button>
              </div>
            ) : (
              plans.map((plan) => {
                const totalMonths = plan.schedule.length;
                const paidMonths = plan.schedule.filter((s) => s.status === 'paid').length;
                const progressPct = Math.round((paidMonths / totalMonths) * 100);
                const isAllPaid = paidMonths === totalMonths;

                return (
                  <div
                    key={plan.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    {/* Plan Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-slate-900 m-0">
                            {plan.title}
                          </h4>
                          {isAllPaid ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Toʻliq yopilgan ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {paidMonths}/{totalMonths} oy toʻlandi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tuzilgan sana: {plan.createdAt} • Muddat: {plan.monthsCount} oy
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleShareTelegram(plan)}
                          className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 transition"
                          title="Telegramga jadvalni joʻnatish"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Chop etish"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          title="Oʻchirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Financial summary numbers */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-slate-50 p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Umumiy summa:</span>
                        <strong className="text-slate-900 font-black">{formatMoney(plan.totalAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Boshlangʻich toʻlov:</span>
                        <strong className="text-emerald-700 font-black">{formatMoney(plan.downPayment)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Qolgan toʻlov:</span>
                        <strong className="text-amber-800 font-black">{formatMoney(plan.remainingAmount)}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Schedule months breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Oylik toʻlovlar taqvimi:
                      </p>

                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {plan.schedule.map((item) => {
                          const isPaid = item.status === 'paid';
                          const today = new Date().toISOString().slice(0, 10);
                          const isOverdue = !isPaid && item.dueDate < today;

                          return (
                            <div
                              key={item.monthNumber}
                              className={`p-2.5 flex items-center justify-between text-xs transition ${
                                isPaid
                                  ? 'bg-emerald-50/40 text-slate-700'
                                  : isOverdue
                                  ? 'bg-rose-50/60 text-slate-900'
                                  : 'bg-white text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                  isPaid
                                    ? 'bg-emerald-600 text-white'
                                    : isOverdue
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {item.monthNumber}
                                </span>
                                <div>
                                  <span className="font-bold">
                                    Muddat: {item.dueDate}
                                  </span>
                                  {isPaid && (
                                    <span className="text-[10px] text-emerald-700 block font-semibold">
                                      ✓ Toʻlangan sana: {item.paidDate}
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-[10px] text-rose-700 block font-bold">
                                      ⚠️ Toʻlov muddati oʻtgan!
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-slate-900">
                                  {formatMoney(item.amount)}
                                </span>

                                {isPaid ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    Toʻlandi
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePayInstallmentMonth(plan.id, item.monthNumber, item.amount)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-lg shadow-xs transition"
                                  >
                                    Toʻlovni olish ✓
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: CREATE NEW PLAN FORM */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreatePlan} className="space-y-4">
            
            {/* Title / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Boʻlib toʻlash maqsadi yoki tovarlar nomi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: 4 qop un va 2 blok moy (Qishki zaxira)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Total Amount & Down Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jami summa (soʻm) *
                </label>
                <input
                  type="number"
                  required
                  min="10000"
                  step="1000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Masalan: 1200000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Boshlangʻich toʻlov (agar boʻlsa)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Duration (Months) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Necha oyga boʻlinadi?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonthsCount(m)}
                    className={`py-2 rounded-xl text-xs font-extrabold transition ${
                      monthsCount === m
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {m} oy
                  </button>
                ))}
              </div>
            </div>

            {/* First payment date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1-oylik toʻlov sanasi (Pensiya yoki oylik kuni)
              </label>
              <input
                type="date"
                required
                value={firstPaymentDate}
                onChange={(e) => setFirstPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Live calculation preview */}
            {totalAmount && !isNaN(totalAmount) && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Hisob-kitob xulosasi:
                </span>
                {(() => {
                  const tot = parseFloat(totalAmount) || 0;
                  const init = parseFloat(downPayment) || 0;
                  const rem = Math.max(0, tot - init);
                  const mon = Math.round(rem / monthsCount);
                  return (
                    <div className="text-xs text-slate-700 space-y-0.5">
                      <p>Qolgan qarz: <strong>{formatMoney(rem)}</strong></p>
                      <p className="text-sm font-black text-emerald-900">
                        Oylik toʻlov: <strong>{formatMoney(mon)}</strong> / oy ({monthsCount} oy davomida)
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Form actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
              >
                Grafikni tasdiqlash va saqlash ✓
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
