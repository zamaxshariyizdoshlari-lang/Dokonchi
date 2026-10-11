import React from 'react';
import { CheckCircle2, Send, Printer, X, Receipt, Sparkles } from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  paymentData,
  settings
}) {
  if (!isOpen || !paymentData) return null;

  const { customerName, amount, remainingBalance, note, date, cashbackEarned } = paymentData;

  const generateTelegramText = () => {
    const shopName = settings.shopName || 'Baraka Doʻkoni';
    let text = `🧾 QARZ TOʻLOVI KVITANSIYASI\n`;
    text += `Doʻkon: ${shopName}\n`;
    text += `Sana: ${date || new Date().toLocaleString('uz-UZ')}\n`;
    text += `------------------------\n`;
    text += `Hurmatli ${customerName}!\n\n`;
    text += `✅ Qabul qilingan toʻlov: ${formatMoney(amount)}\n`;
    text += `📌 Qolgan umumiy qarzingiz: ${formatMoney(remainingBalance)}\n`;
    if (cashbackEarned > 0) {
      text += `🎁 Xushmuomalalik bonusi: +${formatMoney(cashbackEarned)}\n`;
    }
    text += `\nToʻlov uchun katta rahmat, ishlaringizga baraka bersin!`;
    return text;
  };

  const handleSendTelegram = () => {
    const text = generateTelegramText();
    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Success top */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black text-slate-900 m-0">Toʻlov Qabul Qilindi!</h3>
          <p className="text-xs text-slate-500 mt-0.5">Nasiya daftari yangilandi</p>
        </div>

        {/* Paper receipt slip */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-800 space-y-2.5 mb-4">
          <div className="text-center border-b border-dashed border-slate-300 pb-2">
            <h4 className="font-extrabold text-sm uppercase text-slate-900">
              {settings.shopName || 'Baraka Doʻkoni'}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {date || new Date().toLocaleString('uz-UZ')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Mijoz:</span>
            <strong className="text-slate-900 font-bold">{customerName}</strong>
          </div>

          <div className="flex justify-between py-1 border-y border-dashed border-slate-200">
            <span className="text-emerald-800 font-bold">Toʻlangan summa:</span>
            <strong className="text-emerald-800 font-black text-sm">{formatMoney(amount)}</strong>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Qolgan qarz balansi:</span>
            <strong className="text-amber-800 font-black">{formatMoney(remainingBalance)}</strong>
          </div>

          {note && (
            <p className="text-[10px] text-slate-500 italic pt-1">
              Izoh: {note}
            </p>
          )}

          <div className="text-center pt-2 text-[10px] text-slate-400">
            *** Barakangizni bersin! ***
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSendTelegram}
            className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Mijozga Telegram orqali kvitansiya joʻnatish</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs hover:bg-slate-800"
            >
              Yopish ✓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
