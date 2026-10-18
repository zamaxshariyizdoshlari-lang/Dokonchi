import React, { useState } from 'react';
import {
  BookOpen, Search, UserPlus, Phone, MapPin, Calendar, Clock,
  AlertTriangle, CheckCircle, Send, ArrowUpRight, ArrowDownRight,
  DollarSign, FileText, Share2, Copy, Check, CreditCard, QrCode
} from 'lucide-react';
import { formatMoney, generateDebtReminderText, getTelegramShareUrl } from '../utils/storage';

export default function DebtBookView({
  customers,
  settings,
  onOpenCustomerModal,
  onRecordPayment,
  onOpenPensionCalendar,
  onOpenQRCard,
  onOpenInstallments
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('hasDebt'); // 'all', 'hasDebt', 'overdue'
  const [activeCustomer, setActiveCustomer] = useState(customers[0] || null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Today for date comparison
  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'hasDebt') return c.balance > 0;
    if (filterType === 'overdue') return c.balance > 0 && c.dueDate && c.dueDate < todayStr;
    return true;
  });

  // Calculate totals
  const totalDebtAmount = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const debteesCount = customers.filter((c) => c.balance > 0).length;
  const overdueCount = customers.filter((c) => c.balance > 0 && c.dueDate && c.dueDate < todayStr).length;

  const handleMakePayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || !activeCustomer) return;

    const amountNum = parseFloat(paymentAmount);
    if (amountNum <= 0) return;

    onRecordPayment(activeCustomer.id, amountNum, paymentNote || 'Qarz qisman/toʻliq toʻlandi');
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentModal(false);
  };

  const copyReminderText = () => {
    if (!activeCustomer) return;
    const text = generateDebtReminderText(activeCustomer, settings);
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const openTelegramReminder = () => {
    if (!activeCustomer) return;
    const text = generateDebtReminderText(activeCustomer, settings);
    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-amber-500 text-slate-950 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-amber-600/30 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold opacity-80 uppercase tracking-wide">
              Umumiy Nasiya
            </p>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              {formatMoney(totalDebtAmount)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-950/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">
              Nasiyadorlar
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {debteesCount} nafar
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold text-rose-600 uppercase tracking-wide">
              Muddati oʻtgan
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
              {overdueCount} kishi
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Feature 8: Pension & Salary Calendar trigger card */}
        <div
          onClick={onOpenPensionCalendar}
          className="bg-sky-500 hover:bg-sky-600 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-sky-400 cursor-pointer transition active:scale-95 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-sky-100 uppercase tracking-wide">
              📅 Pensiya & Maosh
            </p>
            <h3 className="text-base sm:text-lg font-black mt-1">
              Qarz kalendari →
            </h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Customer List (Left) & Selected Customer Profile (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Customers List (5 or 6 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3">
          
          {/* Search & Add */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ismi yoki telefon raqami..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={onOpenCustomerModal}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center justify-center"
              title="Yangi odam kiritish"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('hasDebt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'hasDebt'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Qarzdorlar ({debteesCount})
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Muddati oʻtgan ({overdueCount})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Barcha odamlar ({customers.length})
            </button>
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredCustomers.map((c) => {
              const isSelected = activeCustomer?.id === c.id;
              const isOverdue = c.balance > 0 && c.dueDate && c.dueDate < todayStr;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCustomer(c)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug truncate">
                          {c.name}
                        </h4>
                        <span className="text-xs font-black text-amber-500 shrink-0">
                          {'★'.repeat(c.rating || 5)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <p className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.address || "Ko'cha ko'rsatilmagan"}</span>
                        </p>
                        {c.cashback > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                            🎁 {formatMoney(c.cashback)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-sm sm:text-base font-black ${
                        c.balance > 0 ? (isOverdue ? 'text-rose-600' : 'text-amber-700') : 'text-emerald-700'
                      }`}>
                        {formatMoney(c.balance)}
                      </span>
                      {isOverdue && (
                        <div className="text-[10px] font-black text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded mt-0.5">
                          Kechikkan!
                        </div>
                      )}
                    </div>
                  </div>

                  {c.creditLimit && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                        <span>Nasiya limiti: {formatMoney(c.creditLimit)}</span>
                        <span className={c.balance >= c.creditLimit ? 'text-rose-600 font-black' : 'text-slate-600'}>
                          {Math.min(100, Math.round((c.balance / c.creditLimit) * 100))}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            c.balance >= c.creditLimit ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, (c.balance / c.creditLimit) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {c.dueDate && c.balance > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Muddat:
                      </span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                        {c.dueDate}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">Hech kim topilmadi</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Selected Customer Deep-Dive Profile (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-7 sticky top-36">
          {activeCustomer ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              
              {/* Header profile info */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Nasiya daftari varaqasi
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1 m-0">
                      {activeCustomer.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> {activeCustomer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" /> {activeCustomer.address}
                      </span>
                    </div>
                    {activeCustomer.note && (
                      <p className="text-xs text-amber-200/90 italic mt-2 bg-white/10 px-2.5 py-1 rounded-lg">
                        ℹ️ Izoh: {activeCustomer.note}
                      </p>
                    )}
                  </div>

                  {/* Big Balance Box */}
                  <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 text-right sm:text-right">
                    <span className="text-xs font-semibold text-slate-300">Qarzdorlik:</span>
                    <div className={`text-2xl sm:text-3xl font-black ${
                      activeCustomer.balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {formatMoney(activeCustomer.balance)}
                    </div>
                    {activeCustomer.dueDate && activeCustomer.balance > 0 && (
                      <span className="text-[11px] text-slate-300 block mt-0.5">
                        Muddat: {activeCustomer.dueDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons for this customer */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                  
                  {/* Pay Debt button */}
                  {activeCustomer.balance > 0 && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                      <span>Qarz toʻlovini qabul qilish</span>
                    </button>
                  )}

                  {/* Feature: Customer QR Nasiya Card */}
                  <button
                    onClick={() => onOpenQRCard && onOpenQRCard(activeCustomer)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition active:scale-95 shadow-sm"
                    title="Xaridorga QR-kodli Nasiya Kartasini chiqarish yoki Telegramga joʻnatish"
                  >
                    <CreditCard className="w-4 h-4 text-slate-950" />
                    <span>🪪 QR Nasiya Kartasi</span>
                  </button>

                  {/* Feature: Installments (Rassrochka) Schedule */}
                  <button
                    onClick={() => onOpenInstallments && onOpenInstallments(activeCustomer)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition active:scale-95 shadow-sm"
                    title="Boʻlib toʻlash grafigi (Un, yem, koʻmir kabi katta xaridlar uchun)"
                  >
                    <Calendar className="w-4 h-4 text-purple-200" />
                    <span>📅 Boʻlib toʻlash ({activeCustomer.installmentPlans?.length || 0})</span>
                  </button>

                  {/* Send Telegram reminder button */}
                  {activeCustomer.balance > 0 && (
                    <button
                      onClick={openTelegramReminder}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl transition active:scale-95 shadow-sm"
                      title="Mijozga Telegram orqali xushmuomala eslatma chekini yuborish"
                    >
                      <Send className="w-4 h-4" />
                      <span>Telegramga eslatma</span>
                    </button>
                  )}

                  {/* Copy SMS text */}
                  {activeCustomer.balance > 0 && (
                    <button
                      onClick={copyReminderText}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition"
                    >
                      {copiedNotification ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Nusxa olindi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>SMS matni</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* History of goods taken and payments */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 m-0">
                    <Clock className="w-5 h-5 text-slate-500" />
                    Olingan tovarlar va toʻlovlar tarixi
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">
                    {activeCustomer.history?.length || 0} ta yozuv
                  </span>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {activeCustomer.history && activeCustomer.history.length > 0 ? (
                    activeCustomer.history.map((record) => {
                      const isDebt = record.type === 'debt';
                      return (
                        <div
                          key={record.id}
                          className={`p-3.5 rounded-2xl border ${
                            isDebt
                              ? 'bg-amber-50/40 border-amber-200/80'
                              : 'bg-emerald-50/40 border-emerald-200/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                isDebt ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isDebt ? (
                                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-sm">
                                  {record.description}
                                </h5>
                                {record.items && (
                                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                    📦 {record.items}
                                  </p>
                                )}
                                <span className="text-[11px] text-slate-400 block mt-1">
                                  {record.date}
                                </span>
                              </div>
                            </div>

                            <span className={`font-black text-sm sm:text-base shrink-0 ${
                              isDebt ? 'text-amber-800' : 'text-emerald-700'
                            }`}>
                              {isDebt ? `+${formatMoney(record.amount)}` : `-${formatMoney(record.amount)}`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-sm font-semibold">Tarix hali boʻsh</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-slate-600">Nasiyador tanlanmagan</p>
              <p className="text-xs text-slate-400 mt-1">
                Chap tarafdagi roʻyxatdan birorta mahalla aʼzosini tanlang
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Payment Modal (To'lov qabul qilish) */}
      {showPaymentModal && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Qarz toʻlovini qabul qilish
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mijoz: <strong className="text-slate-800">{activeCustomer.name}</strong> • Umumiy qarzi: <strong className="text-amber-700">{formatMoney(activeCustomer.balance)}</strong>
            </p>

            <form onSubmit={handleMakePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Toʻlanayotgan summa (soʻmda) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    autoFocus
                    max={activeCustomer.balance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Masalan: 100000"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(activeCustomer.balance.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-lg"
                  >
                    Barchasi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Toʻlov turi / Izoh
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Masalan: Naqd berdi yoki Click orqali oʻtkazdi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md active:scale-95"
                >
                  Qabul qilish ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
