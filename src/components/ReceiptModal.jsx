import React from 'react';
import { CheckCircle2, Printer, Send, X, Store, Calendar, ArrowRight } from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function ReceiptModal({ isOpen, onClose, saleData, settings }) {
  if (!isOpen || !saleData) return null;

  const { cart, total, paymentMethod, customer, timestamp } = saleData;

  const handlePrint = () => {
    window.print();
  };

  // Prepare Telegram check message
  const prepareTelegramCheckText = () => {
    const shopName = settings.shopName || 'Doʻkon';
    let text = `🧾 ${shopName} XARID CHEKI\n`;
    text += `Sana: ${timestamp || new Date().toLocaleString('uz-UZ')}\n`;
    text += `------------------------\n`;
    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.name} (${item.quantity} ${item.unit}) = ${formatMoney(item.price * item.quantity)}\n`;
    });
    text += `------------------------\n`;
    text += `Jami summa: ${formatMoney(total)}\n`;
    
    if (paymentMethod === 'debt' && customer) {
      text += `To'lov turi: NASIYA (Qarzga)\n`;
      text += `Xaridor: ${customer.name}\n`;
      text += `Umumiy qarz balansingiz: ${formatMoney(customer.balance)}\n`;
    } else {
      text += `To'lov turi: ${paymentMethod === 'card' ? 'Plastik karta' : 'Naqd pul'}\n`;
      text += `Holat: To'landi ✓\n`;
    }

    text += `\nXaridingiz uchun rahmat, barakangizni bersin!`;
    return text;
  };

  const handleTelegramShare = () => {
    const text = prepareTelegramCheckText();
    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Top Success Badge */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 m-0">Savdo muvaffaqiyatli!</h3>
          <p className="text-xs text-slate-500 mt-0.5">Xarid qayd etildi va ombor yangilandi</p>
        </div>

        {/* Paper Receipt Simulation */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-700 space-y-3">
          
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-2">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase">
              {settings.shopName || 'Baraka Doʻkoni'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">{settings.address}</p>
            <p className="text-[11px] text-slate-500">Tel: {settings.phone}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              {timestamp || new Date().toLocaleString('uz-UZ')}
            </p>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-200">
            {cart.map((item, idx) => (
              <div key={idx} className="py-1.5 flex justify-between items-start gap-1">
                <div className="flex-1">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <div className="text-[10px] text-slate-500">
                    {item.quantity} {item.unit} × {formatMoney(item.price)}
                  </div>
                </div>
                <span className="font-bold text-slate-900">
                  {formatMoney(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total & Payment Method */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
            <div className="flex justify-between items-baseline font-black text-sm text-slate-900">
              <span>JAMI:</span>
              <span className="text-base text-emerald-800">{formatMoney(total)}</span>
            </div>

            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>Toʻlov usuli:</span>
              <span className="uppercase">
                {paymentMethod === 'debt'
                  ? 'Nasiya (Qarz)'
                  : paymentMethod === 'card'
                  ? 'Karta (Humo/Uzcard)'
                  : 'Naqd pul'}
              </span>
            </div>

            {/* If debt, show customer info */}
            {paymentMethod === 'debt' && customer && (
              <div className="mt-2 pt-2 border-t border-slate-200 bg-amber-50 p-2 rounded-lg font-sans">
                <p className="text-[11px] font-bold text-amber-900">
                  Xaridor: {customer.name}
                </p>
                <p className="text-[11px] font-black text-amber-950 mt-0.5">
                  Jami qarz balansi: {formatMoney(customer.balance)}
                </p>
                {customer.dueDate && (
                  <p className="text-[10px] text-amber-800 mt-0.5">
                    Toʻlov muddati: {customer.dueDate}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400">
            *** Xaridingiz uchun rahmat! ***
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          {/* Telegram receipt button */}
          <button
            onClick={handleTelegramShare}
            className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm rounded-xl transition shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Telegramga chek joʻnatish</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition active:scale-95 shadow-sm"
            >
              Yangi savdo ✓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
