import React, { useState } from 'react';
import { Truck, Send, Copy, Check, X, AlertTriangle, Plus, Minus } from 'lucide-react';
import { getTelegramShareUrl } from '../utils/storage';

export default function SupplierOrderModal({ isOpen, onClose, products, settings }) {
  if (!isOpen) return null;

  // Filter low stock products initially, or allow all
  const lowStockProds = products.filter((p) => p.stock <= p.minStock);
  const initialItems = (lowStockProds.length > 0 ? lowStockProds : products.slice(0, 5)).map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    currentStock: p.stock,
    orderQty: Math.max(10, p.minStock * 2 - p.stock),
    selected: true
  }));

  const [orderItems, setOrderItems] = useState(initialItems);
  const [supplierName, setSupplierName] = useState('Hurmatli taʼminotchi aka');
  const [copied, setCopied] = useState(false);

  const toggleSelect = (id) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateQty = (id, delta) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.orderQty + delta);
          return { ...item, orderQty: newQty };
        }
        return item;
      })
    );
  };

  const generateOrderMessage = () => {
    const shopName = settings.shopName || 'Baraka Doʻkoni';
    const selected = orderItems.filter((i) => i.selected);

    let text = `Assalomu alaykum, ${supplierName}!\n\n`;
    text += `📦 "${shopName}" uchun zarur tovarlar buyurtmasi:\n\n`;

    selected.forEach((item, index) => {
      text += `${index + 1}. ${item.name} — ${item.orderQty} ${item.unit}\n`;
    });

    text += `\nIltimos, yetkazib berish sanasi va narxlarini tasdiqlab bersangiz.\n`;
    text += `Bog'lanish uchun: ${settings.phone || ''} (${settings.ownerName || 'Doʻkondor'})\n`;
    text += `Manzil: ${settings.address || 'Qishloq'}`;

    return text;
  };

  const handleCopy = () => {
    const text = generateOrderMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTelegram = () => {
    const text = generateOrderMessage();
    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  const selectedCount = orderItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg m-0">
                Optomchilarga Buyurtma Generatori
              </h3>
              <p className="text-xs text-slate-500">
                Kam qolgan tovarlarni bir zumda optomchiga joʻnating
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

        {/* Supplier Name Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Optomchi / Taʼminotchi ismi yoki firmasi:
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="Masalan: Baxtiyor aka (Unchi) yoki Shakar Optom"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition flex items-center justify-between gap-2 ${
                item.selected
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Qoldiq: {item.currentStock} {item.unit}
                  </span>
                </div>
              </div>

              {item.selected && (
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, -5)}
                    className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-xs text-slate-800">
                    {item.orderQty} {item.unit}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 5)}
                    className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Preview Box */}
        <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-xs font-mono mb-4 whitespace-pre-wrap max-h-36 overflow-y-auto border border-slate-800">
          {generateOrderMessage()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Nusxa olindi!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Nusxa olish</span>
              </>
            )}
          </button>

          <button
            disabled={selectedCount === 0}
            onClick={handleSendTelegram}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl transition shadow-md active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>Telegram orqali joʻnatish</span>
          </button>
        </div>

      </div>
    </div>
  );
}
