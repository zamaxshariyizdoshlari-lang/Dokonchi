import React, { useState } from 'react';
import {
  RotateCcw, Search, X, Check, AlertTriangle, ArrowRight,
  Package, Banknote, CreditCard, BookOpen, Clock, Printer
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function ReturnProductModal({
  isOpen,
  onClose,
  transactions = [],
  products = [],
  customers = [],
  onProcessReturn
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [returnItems, setReturnItems] = useState({}); // { itemId: qtyToReturn }
  const [returnReason, setReturnReason] = useState('Xaridor fikridan qaytdi');
  const [refundMethod, setRefundMethod] = useState('cash'); // 'cash' | 'card' | 'debt_deduct'

  if (!isOpen) return null;

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.id.toLowerCase().includes(term) ||
      (tx.customerName && tx.customerName.toLowerCase().includes(term)) ||
      (tx.itemsSummary && tx.itemsSummary.toLowerCase().includes(term))
    );
  }).slice(0, 15);

  const handleSelectTx = (tx) => {
    setSelectedTx(tx);
    // Initialize return quantities
    const initItems = {};
    if (tx.cart) {
      tx.cart.forEach((item) => {
        initItems[item.id] = 0;
      });
    }
    setReturnItems(initItems);
    setRefundMethod(tx.paymentMethod === 'debt' ? 'debt_deduct' : 'cash');
  };

  const handleQtyChange = (itemId, maxQty, delta) => {
    setReturnItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [itemId]: next };
    });
  };

  // Calculate return total
  let returnTotal = 0;
  if (selectedTx && selectedTx.cart) {
    selectedTx.cart.forEach((item) => {
      const qty = returnItems[item.id] || 0;
      returnTotal += item.price * qty;
    });
  }

  const hasItemsToReturn = returnTotal > 0;

  const handleSubmitReturn = (e) => {
    e.preventDefault();
    if (!hasItemsToReturn || !selectedTx) return;

    const itemsToReturnList = selectedTx.cart
      .map((item) => ({
        product: item,
        quantity: returnItems[item.id] || 0,
        refundAmount: item.price * (returnItems[item.id] || 0)
      }))
      .filter((i) => i.quantity > 0);

    onProcessReturn({
      originalTransaction: selectedTx,
      items: itemsToReturnList,
      totalRefund: returnTotal,
      refundMethod,
      reason: returnReason,
      customerId: selectedTx.customerId || null
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg m-0">
                Tovarni qaytarish (Vozvrat)
              </h3>
              <p className="text-xs text-slate-500 m-0">
                Chek boʻyicha tovar qoldigʻi va kassani toʻgʻrilash
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

        {/* STEP 1: Search & Pick Transaction */}
        {!selectedTx ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Chek ID, xaridor ismi yoki tovar nomi boʻyicha qidirish..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>

            <p className="text-xs font-bold text-slate-600">
              Qaytariladigan xaridni tanlang:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredTxs.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => handleSelectTx(tx)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 cursor-pointer transition flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {tx.id}
                      </span>
                      <span className="text-xs font-black text-slate-900 truncate">
                        {tx.customerName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {tx.itemsSummary}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tx.date}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-slate-900 block">
                      {formatMoney(tx.total)}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5 justify-end">
                      Tanlash →
                    </span>
                  </div>
                </div>
              ))}

              {filteredTxs.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Bunday savdo topilmadi
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: Choose items to return */
          <form onSubmit={handleSubmitReturn} className="space-y-4">
            
            {/* Selected Transaction Summary Header */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tanlangan chek: {selectedTx.id}
                </span>
                <h4 className="font-black text-sm text-white m-0">
                  {selectedTx.customerName} ({formatMoney(selectedTx.total)})
                </h4>
                <span className="text-[10px] text-slate-400">
                  Sana: {selectedTx.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-xs font-bold text-rose-300 hover:text-white underline"
              >
                Boshqasini tanlash
              </button>
            </div>

            {/* Items list with quantity adjuster */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Qaysi tovarlar qaytarilmoqda?
              </label>

              {selectedTx.cart && selectedTx.cart.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {selectedTx.cart.map((item) => {
                    const returnQty = returnItems[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 flex items-center justify-between gap-2 text-xs transition ${
                          returnQty > 0 ? 'bg-rose-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-slate-900 truncate">
                            {item.name}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            Xarid qilingan: {item.quantity} {item.unit} • {formatMoney(item.price)}
                          </span>
                        </div>

                        {/* Adjuster */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                              className="w-6 h-6 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-black text-slate-900">
                              {returnQty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                              className="w-6 h-6 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <span className="w-20 text-right font-black text-rose-700">
                            {formatMoney(item.price * returnQty)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs">
                  Ushbu chekda tovarlar tafsiloti saqlanmagan. Qoʻlda umumiy summani kiriting.
                </div>
              )}
            </div>

            {/* Total Refund Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide block">
                  Qaytariladigan summa:
                </span>
                <span className="text-xl font-black text-rose-800">
                  {formatMoney(returnTotal)}
                </span>
              </div>
              <span className="text-xs text-rose-700 font-semibold">
                Omborga tovarlar qaytariladi ✓
              </span>
            </div>

            {/* Refund Method & Reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pulni qanday qaytarish:
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="cash">💵 Kassadan Naqd pul qaytarish</option>
                  <option value="card">💳 Plastik kartaga qaytarish</option>
                  {selectedTx.customerId && (
                    <option value="debt_deduct">📒 Nasiya qarzini kamaytirish</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qaytarish sababi:
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Masalan: Yaroqsiz yoki mos kelmadi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Orqaga
              </button>
              <button
                type="submit"
                disabled={!hasItemsToReturn}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95"
              >
                Vozvratni tasdiqlash ✓
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
