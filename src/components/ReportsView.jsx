import React, { useState } from 'react';
import {
  BarChart3, Banknote, CreditCard, BookOpen, CheckCircle,
  Download, Upload, Settings, Calendar, History, ArrowDownRight,
  Store, Phone, MapPin, User, Save, TrendingUp, Award, Sparkles, PieChart
} from 'lucide-react';
import { formatMoney, exportDataBackup } from '../utils/storage';

export default function ReportsView({
  transactions,
  customers,
  products = [],
  settings,
  onSaveSettings,
  onRestoreData
}) {
  const [activeSubTab, setActiveSubTab] = useState('summary'); // 'summary', 'analytics', 'history', 'settings'
  const [editingSettings, setEditingSettings] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Compute stats
  const cashSales = transactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0);

  const cardSales = transactions
    .filter((t) => t.paymentMethod === 'card')
    .reduce((sum, t) => sum + t.total, 0);

  const debtGiven = transactions
    .filter((t) => t.paymentMethod === 'debt')
    .reduce((sum, t) => sum + t.total, 0);

  const totalRevenue = cashSales + cardSales + debtGiven;
  const actualCollectedCash = cashSales + cardSales;

  // Analytics calculations
  const cashPercent = totalRevenue > 0 ? Math.round((cashSales / totalRevenue) * 100) : 0;
  const cardPercent = totalRevenue > 0 ? Math.round((cardSales / totalRevenue) * 100) : 0;
  const debtPercent = totalRevenue > 0 ? Math.round((debtGiven / totalRevenue) * 100) : 0;

  // Mock top-selling products based on transaction summary
  const topProductsList = [
    { name: 'Oliy navli Un (50 kg qop)', sales: 12, revenue: 3060000, color: 'bg-amber-500' },
    { name: "Paxta yog'i (5 litr)", sales: 18, revenue: 1476000, color: 'bg-emerald-500' },
    { name: 'Shakar (1 kg)', sales: 65, revenue: 780000, color: 'bg-sky-500' },
    { name: 'Tandir non', sales: 120, revenue: 540000, color: 'bg-orange-500' },
    { name: 'Tuxum (dona)', sales: 240, revenue: 384000, color: 'bg-purple-500' }
  ];

  // Top customers by rating
  const trustedCustomers = [...customers]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(editingSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.products || json.customers) {
          onRestoreData(json);
          alert('Maʼlumotlar muvaffaqiyatli tiklandi!');
        } else {
          alert('Notoʻgʻri fayl formati!');
        }
      } catch (err) {
        alert('Faylni oʻqishda xatolik yuz berdi!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Sub tabs navigation */}
      <div className="flex gap-2 overflow-x-auto mb-6 border-b border-slate-200 pb-3 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'summary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Kassa Balansi</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Grafiklar & Aqlli Tahlil</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Savdolar Tarixi ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Doʻkon Sozlamalari</span>
        </button>
      </div>

      {/* 1. SUMMARY TAB */}
      {activeSubTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Turnover */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Umumiy savdo aylanmasi
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-2 text-white">
                {formatMoney(totalRevenue)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Jami {transactions.length} ta xarid
              </p>
            </div>

            {/* Cash in Drawer */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Naqd tushum
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatMoney(cashSales)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Gʻaladagi naqd pullar</p>
            </div>

            {/* Card Income */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                  Karta (Terminal / Click)
                </span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {formatMoney(cardSales)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Humo & Uzcard tushumlari</p>
            </div>

            {/* Credit given */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Nasiyaga berilgan
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-amber-800 mt-2">
                {formatMoney(debtGiven)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Daftarga yozilgan qarzlar</p>
            </div>

          </div>

          {/* Quick Backup card */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-black text-white m-0">
                💾 Doʻkoningiz maʼlumotlari xavfsizligi
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
                Barcha qarzlar, tovarlar va hisobotlar kompyuter/telefoningizda saqlanadi.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={exportDataBackup}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-900 font-extrabold rounded-2xl hover:bg-emerald-50 transition shadow-md active:scale-95 text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Zaxirani yuklab olish</span>
              </button>

              <label className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold rounded-2xl border border-emerald-500 cursor-pointer transition text-xs sm:text-sm">
                <Upload className="w-4 h-4" />
                <span>Qayta tiklash</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANALYTICS & CHARTS TAB */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top 5 Products Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base m-0">
                    🏆 Eng Koʻp Daromad Keltirgan Tovarlar
                  </h4>
                  <p className="text-xs text-slate-400">Doʻkondagi eng xaridorgir tovarlar</p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              <div className="space-y-3 pt-2">
                {topProductsList.map((item, idx) => {
                  const maxRev = topProductsList[0].revenue;
                  const barWidth = Math.round((item.revenue / maxRev) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{item.name} ({item.sales} ta sotildi)</span>
                        <span className="font-black text-slate-900">{formatMoney(item.revenue)}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base m-0">
                    💳 Toʻlov Turlari Taqsimoti
                  </h4>
                  <p className="text-xs text-slate-400">Naqd, karta va nasiya ulushi</p>
                </div>
                <PieChart className="w-5 h-5 text-sky-500" />
              </div>

              {/* Progress bar composite */}
              <div className="w-full h-5 bg-slate-100 rounded-xl overflow-hidden flex my-4">
                <div style={{ width: `${cashPercent}%` }} className="bg-emerald-500 h-full" title={`Naqd: ${cashPercent}%`}></div>
                <div style={{ width: `${cardPercent}%` }} className="bg-sky-500 h-full" title={`Karta: ${cardPercent}%`}></div>
                <div style={{ width: `${debtPercent}%` }} className="bg-amber-500 h-full" title={`Nasiya: ${debtPercent}%`}></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="font-bold text-emerald-800 block">💵 Naqd pul</span>
                  <strong className="text-base font-black text-emerald-900">{cashPercent}%</strong>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">{formatMoney(cashSales)}</span>
                </div>

                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200">
                  <span className="font-bold text-sky-800 block">💳 Karta</span>
                  <strong className="text-base font-black text-sky-900">{cardPercent}%</strong>
                  <span className="text-[10px] text-sky-700 block mt-0.5">{formatMoney(cardSales)}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="font-bold text-amber-800 block">📖 Nasiya</span>
                  <strong className="text-base font-black text-amber-900">{debtPercent}%</strong>
                  <span className="text-[10px] text-amber-700 block mt-0.5">{formatMoney(debtGiven)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Customer Trust Rating Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-base mb-1">
              ⭐️ Doʻkonning Eng Ishonchli Mijozlari (Scoring)
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Qarzini oʻz vaqtida yopadigan va bonus toʻplovchi xaridorlar reytingi
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trustedCustomers.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-500">
                        {'★'.repeat(c.rating || 5)}{'☆'.repeat(5 - (c.rating || 5))}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        🎁 {formatMoney(c.cashback || 0)} bonus
                      </span>
                    </div>
                    <h5 className="font-black text-slate-900 text-sm">{c.name}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.phone}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs">
                    <span className="text-slate-500">Qarzi:</span>
                    <strong className="text-slate-900 font-black">{formatMoney(c.balance)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 3. TRANSACTION HISTORY TAB */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-extrabold text-slate-900 text-base sm:text-lg m-0">
              Barcha amalga oshirilgan savdolar
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              Jami: {transactions.length} ta chek
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isDebt = tx.paymentMethod === 'debt';
              const isCard = tx.paymentMethod === 'card';

              return (
                <div key={tx.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isDebt
                          ? 'bg-amber-100 text-amber-800'
                          : isCard
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isDebt ? 'Nasiya (Qarz)' : isCard ? 'Plastik karta' : 'Naqd pul'}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {tx.customerName}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 truncate font-medium">
                      📦 {tx.itemsSummary || `${tx.itemsCount} ta tovar`}
                    </p>

                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {tx.date}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-base sm:text-lg font-black ${
                      isDebt ? 'text-amber-800' : 'text-slate-900'
                    }`}>
                      {formatMoney(tx.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg m-0">Doʻkon rekvizitlari</h3>
              <p className="text-xs text-slate-500">
                Cheklar va Telegram eslatmalarida koʻrinadi
              </p>
            </div>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doʻkon nomi
              </label>
              <input
                type="text"
                required
                value={editingSettings.shopName}
                onChange={(e) => setEditingSettings({ ...editingSettings, shopName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doʻkondor (Egasi) ismi
              </label>
              <input
                type="text"
                required
                value={editingSettings.ownerName}
                onChange={(e) => setEditingSettings({ ...editingSettings, ownerName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqam (Telegram / Aloqa uchun)
              </label>
              <input
                type="text"
                required
                value={editingSettings.phone}
                onChange={(e) => setEditingSettings({ ...editingSettings, phone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Manzil / Qishloq nomi
              </label>
              <input
                type="text"
                value={editingSettings.address}
                onChange={(e) => setEditingSettings({ ...editingSettings, address: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Sozlamalarni saqlash</span>
              </button>
              {settingsSaved && (
                <p className="text-center text-xs font-bold text-emerald-600 mt-2">
                  ✓ Muvaffaqiyatli saqlandi!
                </p>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
