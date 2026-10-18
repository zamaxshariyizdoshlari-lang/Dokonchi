import React, { useState } from 'react';
import {
  ClipboardCheck, Search, X, Check, AlertTriangle, TrendingDown,
  TrendingUp, RefreshCw, Printer, Camera, ArrowRight, ShieldAlert
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function StockAuditModal({
  isOpen,
  onClose,
  products = [],
  onApplyAudit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'discrepancy' | 'shortage' | 'surplus'
  // { productId: actualCountedQty }
  const [countedStock, setCountedStock] = useState(() => {
    const initial = {};
    products.forEach((p) => {
      initial[p.id] = p.stock || 0; // Default matches system
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleQtyChange = (productId, val) => {
    const num = parseInt(val);
    setCountedStock((prev) => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleQuickAdjust = (productId, delta) => {
    setCountedStock((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      return { ...prev, [productId]: Math.max(0, current + delta) };
    });
  };

  // Calculations
  let totalShortageSum = 0;
  let totalSurplusSum = 0;
  let totalDiscrepantCount = 0;

  const auditedList = products.map((p) => {
    const expected = p.stock || 0;
    const actual = countedStock[p.id] !== undefined ? countedStock[p.id] : expected;
    const diff = actual - expected; // < 0 is shortage, > 0 is surplus
    const lossOrGainMoney = diff * (p.costPrice || p.price);

    if (diff < 0) totalShortageSum += Math.abs(lossOrGainMoney);
    if (diff > 0) totalSurplusSum += lossOrGainMoney;
    if (diff !== 0) totalDiscrepantCount++;

    return {
      product: p,
      expected,
      actual,
      diff,
      lossOrGainMoney
    };
  });

  // Filtered
  const filteredList = auditedList.filter((item) => {
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product.barcode && item.product.barcode.includes(searchTerm));

    if (!matchesSearch) return false;

    if (filterType === 'discrepancy') return item.diff !== 0;
    if (filterType === 'shortage') return item.diff < 0;
    if (filterType === 'surplus') return item.diff > 0;
    return true;
  });

  const handleConfirmAudit = () => {
    if (
      !confirm(
        `Reviziyani tasdiqlamoqchimisiz?\n${totalDiscrepantCount} ta tovar bo'yicha qoldiqlar yangilanadi.\nKamomad zarari: ${formatMoney(totalShortageSum)}`
      )
    )
      return;

    const updates = auditedList.map((item) => ({
      productId: item.product.id,
      newStock: item.actual,
      diff: item.diff
    }));

    onApplyAudit({
      updates,
      totalShortageSum,
      totalSurplusSum,
      totalDiscrepantCount,
      date: new Date().toLocaleString('uz-UZ')
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ClipboardCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg m-0">
                Inventarizatsiya & Reviziya (Ombor sanogʻi)
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Dasturdagi qoldiqni amaldagi tokchadagi tovarlar bilan solishtirish
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

        {/* Audit Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 bg-slate-900 text-white rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
              Farqli tovarlar soni:
            </span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">
              {totalDiscrepantCount} ta tovar
            </span>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
            <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wide block">
              ⚠️ Kamomad (Nedostacha zarari):
            </span>
            <span className="text-xl font-black text-rose-700 mt-0.5 block">
              -{formatMoney(totalShortageSum)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide block">
              Ortiqchalik (Izlishek):
            </span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">
              +{formatMoney(totalSurplusSum)}
            </span>
          </div>
        </div>

        {/* Search & Filter pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tovarni qidirish..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Barchasi ({products.length})
            </button>
            <button
              onClick={() => setFilterType('discrepancy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === 'discrepancy'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              Farqlilar ({totalDiscrepantCount})
            </button>
            <button
              onClick={() => setFilterType('shortage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === 'shortage'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Kamomad
            </button>
          </div>
        </div>

        {/* Items Comparison Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-3">Tovar nomi</th>
                <th className="p-3 text-center">Dasturda</th>
                <th className="p-3 text-center">Amalda (Sanalgan)</th>
                <th className="p-3 text-right">Farq & Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.map((item) => {
                const isShortage = item.diff < 0;
                const isSurplus = item.diff > 0;

                return (
                  <tr
                    key={item.product.id}
                    className={`transition ${
                      isShortage
                        ? 'bg-rose-50/40'
                        : isSurplus
                        ? 'bg-emerald-50/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.product.image || '📦'}</span>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">
                            {item.product.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            Tannarx: {formatMoney(item.product.costPrice || item.product.price)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center font-bold text-slate-600">
                      {item.expected} {item.product.unit}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={item.actual}
                          onChange={(e) => handleQtyChange(item.product.id, e.target.value)}
                          className="w-14 text-center font-black text-xs py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-3 text-right">
                      {item.diff === 0 ? (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ✓ Mos (0)
                        </span>
                      ) : (
                        <div>
                          <span
                            className={`font-black text-xs ${
                              isShortage ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {item.diff > 0 ? `+${item.diff}` : item.diff} {item.product.unit}
                          </span>
                          <span className="block text-[10px] font-semibold text-slate-500">
                            {formatMoney(Math.abs(item.lossOrGainMoney))}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Bekor qilish
          </button>
          
          <button
            type="button"
            onClick={handleConfirmAudit}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            Reviziyani yakunlash va Qoldiqlarni yangilash ✓
          </button>
        </div>

      </div>
    </div>
  );
}
