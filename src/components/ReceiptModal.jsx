import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2, Printer, Send, X, Store, Calendar, ArrowRight,
  Layers, Scissors, ShieldCheck, Sparkles
} from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function ReceiptModal({ isOpen, onClose, saleData, settings }) {
  const [receiptMode, setReceiptMode] = useState('58mm'); // 'standard' | '58mm' | '80mm'
  const [receiptQrUrl, setReceiptQrUrl] = useState('');

  const shopName = settings?.shopName || 'Baraka Baqqollik Doʻkoni';
  const shopPhone = settings?.phone || '+998 90 999 88 77';
  const shopAddress = settings?.address || 'Oltintepa qishlogʻi';
  const cashierName = settings?.ownerName || 'Kassir';

  useEffect(() => {
    if (!saleData) return;

    // Generate Verification QR code for receipt
    const checkId = `CHK-${Date.now().toString().slice(-6)}`;
    const qrData = `BARAKA-CHECK|${checkId}|${saleData.total}|${saleData.timestamp || ''}`;

    QRCode.toDataURL(qrData, {
      width: 140,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
      .then((url) => setReceiptQrUrl(url))
      .catch((e) => console.error(e));
  }, [saleData]);

  if (!isOpen || !saleData) return null;

  const { cart, total, paymentMethod, customer, timestamp, receivedAmount, changeAmount } = saleData;
  const checkId = `CHK-${Date.now().toString().slice(-6)}`;

  const handlePrint = () => {
    window.print();
  };

  // Telegram check message
  const prepareTelegramCheckText = () => {
    let text = `🧾 ${shopName} XARID CHEKI\n`;
    text += `Chek №: ${checkId}\n`;
    text += `Sana: ${timestamp || new Date().toLocaleString('uz-UZ')}\n`;
    text += `Kassir: ${cashierName}\n`;
    text += `--------------------------------\n`;
    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.name} (${item.quantity} ${item.unit}) = ${formatMoney(item.price * item.quantity)}\n`;
    });
    text += `--------------------------------\n`;
    text += `JAMI SUMMA: ${formatMoney(total)}\n`;

    if (paymentMethod === 'debt' && customer) {
      text += `To'lov turi: NASIYA (Qarzga)\n`;
      text += `Xaridor: ${customer.name}\n`;
      text += `Jami qarz balansingiz: ${formatMoney(customer.balance)}\n`;
      if (customer.dueDate) text += `Kelishilgan muddat: ${customer.dueDate}\n`;
    } else {
      text += `To'lov turi: ${paymentMethod === 'card' ? 'Plastik karta' : 'Naqd pul'}\n`;
      if (receivedAmount > 0) {
        text += `Qabul qilindi: ${formatMoney(receivedAmount)}\n`;
        text += `Qaytim berildi: ${formatMoney(changeAmount || 0)}\n`;
      }
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto">
        
        {/* Top Success Badge */}
        <div className="text-center mb-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 m-0">
            Savdo muvaffaqiyatli yakunlandi!
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ombordagi tovarlar soni yangilandi
          </p>
        </div>

        {/* Receipt Width Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-3 text-xs font-bold">
          <button
            type="button"
            onClick={() => setReceiptMode('58mm')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              receiptMode === '58mm'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🖨 58mm Termo
          </button>
          <button
            type="button"
            onClick={() => setReceiptMode('80mm')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              receiptMode === '80mm'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🖨 80mm Termo
          </button>
          <button
            type="button"
            onClick={() => setReceiptMode('standard')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              receiptMode === 'standard'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📄 Oddiy
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="flex justify-center my-2">
          
          {/* THERMAL SLIP VIEW (58mm or 80mm) */}
          {(receiptMode === '58mm' || receiptMode === '80mm') && (
            <div
              className={`bg-white border-2 border-dashed border-slate-300 p-4 text-black font-mono shadow-sm select-text ${
                receiptMode === '58mm' ? 'w-[290px] text-[11px]' : 'w-[360px] text-xs'
              }`}
              style={{ fontFamily: '"Courier New", Courier, monospace' }}
            >
              {/* Thermal Store Header */}
              <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
                <h4 className="font-black text-sm uppercase tracking-wide">
                  {shopName}
                </h4>
                <p className="text-[10px] leading-tight">{shopAddress}</p>
                <p className="text-[10px]">Tel: {shopPhone}</p>
                <div className="pt-1 flex justify-between text-[10px]">
                  <span>Chek: {checkId}</span>
                  <span>{cashierName}</span>
                </div>
                <p className="text-[9px] text-slate-600">
                  {timestamp || new Date().toLocaleString('uz-UZ')}
                </p>
              </div>

              {/* Items Table */}
              <div className="py-2 space-y-1.5 border-b border-dashed border-black">
                {cart.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold truncate">
                      {idx + 1}. {item.name}
                    </div>
                    <div className="flex justify-between pl-2 text-[10px]">
                      <span>
                        {item.quantity} {item.unit} × {formatMoney(item.price)}
                      </span>
                      <span className="font-black">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial calculations */}
              <div className="py-2 border-b border-dashed border-black space-y-1">
                <div className="flex justify-between items-baseline font-black text-sm">
                  <span>JAMI TOʻLOV:</span>
                  <span className="text-base">{formatMoney(total)}</span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span>Toʻlov turi:</span>
                  <span className="font-bold uppercase">
                    {paymentMethod === 'debt'
                      ? 'NASIYA (Qarz)'
                      : paymentMethod === 'card'
                      ? 'Plastik Karta'
                      : 'Naqd Pul'}
                  </span>
                </div>

                {receivedAmount > 0 && (
                  <>
                    <div className="flex justify-between text-[10px]">
                      <span>Naqd olindi:</span>
                      <span>{formatMoney(receivedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Qaytim (Sdacha):</span>
                      <span>{formatMoney(changeAmount || 0)}</span>
                    </div>
                  </>
                )}

                {/* If Debt, show debtor statement */}
                {paymentMethod === 'debt' && customer && (
                  <div className="mt-1.5 pt-1.5 border-t border-dotted border-black text-[10px] space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>Nasiyador:</span>
                      <span>{customer.name}</span>
                    </div>
                    <div className="flex justify-between font-black">
                      <span>Jami qarzi:</span>
                      <span>{formatMoney(customer.balance)}</span>
                    </div>
                    {customer.dueDate && (
                      <div className="flex justify-between text-[9px]">
                        <span>Toʻlov muddati:</span>
                        <span>{customer.dueDate}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verification QR Code at the bottom of thermal slip */}
              <div className="pt-3 text-center flex flex-col items-center">
                {receiptQrUrl && (
                  <img
                    src={receiptQrUrl}
                    alt="Chek QR"
                    className="w-20 h-20 object-contain mx-auto border border-black p-0.5"
                  />
                )}
                <span className="text-[8px] tracking-widest uppercase mt-1">
                  KOD: {checkId}
                </span>
                <p className="text-[9px] mt-1 italic">
                  *** Xaridingiz uchun rahmat! ***
                </p>
                
                {/* Paper cutting line */}
                <div className="w-full pt-2 mt-2 border-t border-dashed border-slate-400 flex items-center justify-center gap-1 text-[8px] text-slate-500">
                  <Scissors className="w-3 h-3" />
                  <span>kesish chizigʻi (cut here)</span>
                </div>
              </div>

            </div>
          )}

          {/* STANDARD VIEW */}
          {receiptMode === 'standard' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 space-y-3 w-full">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                  {shopName}
                </h4>
                <p className="text-[11px] text-slate-500">{shopAddress}</p>
                <p className="text-[11px] text-slate-500">Tel: {shopPhone}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {timestamp || new Date().toLocaleString('uz-UZ')}
                </p>
              </div>

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

                {paymentMethod === 'debt' && customer && (
                  <div className="mt-2 pt-2 border-t border-slate-200 bg-amber-50 p-2 rounded-lg font-sans">
                    <p className="text-[11px] font-bold text-amber-900">
                      Xaridor: {customer.name}
                    </p>
                    <p className="text-[11px] font-black text-amber-950 mt-0.5">
                      Jami qarz balansi: {formatMoney(customer.balance)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={handleTelegramShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Telegramga chek joʻnatish</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish ({receiptMode})</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition active:scale-95 shadow-sm"
            >
              Yangi savdo ✓
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
