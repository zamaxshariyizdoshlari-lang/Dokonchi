import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  CreditCard, Printer, Send, Download, X, Star, CheckCircle,
  ShieldCheck, Phone, MapPin, Sparkles, Award
} from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function CustomerQRCardModal({ isOpen, onClose, customer, settings }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!customer) return;

    // Payload formatted as standard customer identifier
    const qrPayload = `CUSTOMER:${customer.id}`;

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [customer]);

  if (!isOpen || !customer) return null;

  const shopName = settings?.shopName || 'Baraka Baqqollik Doʻkoni';
  const shopPhone = settings?.phone || '+998 90 999 88 77';
  const ratingStars = customer.rating || 5;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `nasiya_kartasi_${customer.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleShareTelegram = () => {
    const text = `🪪 HURMATLI ${customer.name.toUpperCase()}!\n\n` +
      `Sizga "${shopName}" do'konimizning shaxsiy "Nasiya va Baraka Kartasi" biriktirildi.\n\n` +
      `⭐️ Ishonch reytingingiz: ${'★'.repeat(ratingStars)} (${ratingStars}/5)\n` +
      `🎁 Yig'ilgan keshbek: ${formatMoney(customer.cashback || 0)}\n` +
      `💳 Qarz limitingiz: ${formatMoney(customer.creditLimit || 500000)}\n` +
      `📌 Hozirgi qarz balansi: ${formatMoney(customer.balance || 0)}\n\n` +
      `Do'konga kelganda ushbu kartangizni yoki QR-kodingizni ko'rsatib, 1 soniyada xarid qilishingiz mumkin!\n\n` +
      `Do'konimiz: ${shopName}\n` +
      `Bog'lanish: ${shopPhone}`;

    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Xaridorning QR Nasiya Kartasi
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Kassada 1 soniyada tanish va qarz/keshbek hisoblash
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

        {/* Printable Card Area */}
        <div className="py-4 print:py-0">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-amber-950 text-white p-5 sm:p-6 shadow-xl border border-amber-500/30"
          >
            {/* Background luxury watermark pattern */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Top Bar of the Card */}
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Baraka Savdo • Nasiya & Keshbek
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-0.5">
                  {shopName}
                </h4>
              </div>

              {/* Chip simulation */}
              <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-600/40 shadow-xs flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="border-r border-amber-800/40"></div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* QR Code and Details Center */}
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 my-2">
              {/* QR Code Canvas/Image */}
              <div className="bg-white p-2 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Kod: ${customer.name}`}
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-slate-400 text-xs">
                    Yuklanmoqda...
                  </div>
                )}
                <span className="text-[9px] font-black tracking-widest text-slate-800 mt-1 uppercase">
                  ID: {customer.id}
                </span>
              </div>

              {/* Customer Details */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <span className="text-amber-400 text-xs font-black">
                    {'★'.repeat(ratingStars)}
                  </span>
                  <span className="text-[10px] text-amber-200 font-bold">
                    ({ratingStars}.0 Reyting)
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  {customer.name}
                </h3>

                <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{customer.phone || 'Telefon kiritilmagan'}</span>
                </p>

                <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1 truncate">
                  <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{customer.address || "Mahalla / Ko'cha"}</span>
                </p>

                <div className="pt-1.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    🎁 Bonus: {formatMoney(customer.cashback || 0)}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-300 border border-amber-400/30">
                    Limit: {formatMoney(customer.creditLimit || 500000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 relative z-10 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Rasmiy Mahalla Nasiya Kartasi
              </span>
              <span className="font-mono text-amber-300 text-[10px]">
                {customer.dueDate ? `Muddat: ${customer.dueDate}` : 'Ishonchli xaridor'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 space-y-1 mb-4">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Qanday ishlatiladi?
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            1. Ushbu kartani printerda chiqarib berishingiz yoki Telegram orqali xaridor telefoniga joʻnatishingiz mumkin.<br />
            2. Xaridor xarid qilayotganda POS kassa skaneri orqali kartadagi QR-kodni skaner qilsangiz, avtomatik uning hisobi ochiladi!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Telegram share */}
          <button
            onClick={handleShareTelegram}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Telegramga</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Chop etish</span>
          </button>

          {/* Download QR */}
          <button
            onClick={handleDownloadImage}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>QR Yuklash</span>
          </button>
        </div>

      </div>
    </div>
  );
}
