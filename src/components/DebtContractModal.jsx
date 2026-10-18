import React from 'react';
import {
  FileText, Printer, Send, X, ShieldCheck, CheckCircle,
  Calendar, Phone, MapPin, User
} from 'lucide-react';
import { formatMoney, getTelegramShareUrl } from '../utils/storage';

export default function DebtContractModal({
  isOpen,
  onClose,
  customer,
  settings
}) {
  if (!isOpen || !customer) return null;

  const shopName = settings?.shopName || 'Baraka Baqqollik Doʻkoni';
  const ownerName = settings?.ownerName || 'Umarali aka';
  const shopPhone = settings?.phone || '+998 90 999 88 77';
  const shopAddress = settings?.address || 'Oltintepa qishlogʻi';
  const today = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareTelegram = () => {
    let text = `📜 NASIYA VA QARZDORLIK SOLISHTIRMA DALOLATNOMASI\n\n`;
    text += `Hurmatli: ${customer.name}\n`;
    text += `Do'kon: ${shopName}\n`;
    text += `Manzil: ${shopAddress}\n`;
    text += `Sana: ${today}\n`;
    text += `------------------------------------\n`;
    text += `JAMI QARZDORLIK SUMMASI: ${formatMoney(customer.balance || 0)}\n`;
    if (customer.dueDate) {
      text += `Kelishilgan to'lov muddati: ${customer.dueDate}\n`;
    }
    text += `------------------------------------\n`;
    text += `Ushbu ma'lumot o'zaro hisob-kitoblar aniqligini tasdiqlash uchun yuborildi.\n`;
    text += `Savollar bo'yicha bog'lanish: ${shopPhone}`;

    const url = getTelegramShareUrl(text);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">
                Qarz solishtirma dalolatnomasi (Akt Sverki)
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Yuridik kuchga ega rasmiy tilxat va imzo hujjati
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

        {/* Printable Paper Document (A4/A5 style) */}
        <div className="bg-slate-50/60 border-2 border-slate-300 rounded-2xl p-6 sm:p-8 text-slate-900 space-y-5 print:p-0 print:border-none print:bg-white">
          
          {/* Document Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <span className="text-[10px] tracking-widest uppercase font-extrabold text-slate-500 block mb-1">
              OʻZARO HISOB-KITOB HUJJATI
            </span>
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950 m-0">
              NASIYA VA QARZDORLIK SOLISHTIRMA DALOLATNOMASI
            </h2>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200">
              <span>{shopAddress}</span>
              <span className="font-bold">{today}</span>
            </div>
          </div>

          {/* Parties information */}
          <div className="text-xs sm:text-sm leading-relaxed space-y-2 text-slate-800">
            <p>
              Biz, quyida imzo chekuvchilar: bir tomondan <strong>«{shopName}»</strong> rahbari/egasi <strong>{ownerName}</strong>, 
              ikkinchi tomondan mahalla fuqarosi <strong>{customer.name}</strong> (tel: {customer.phone || '—'}, manzil: {customer.address || '—'}) 
              ushbu dalolatnomani tuzdik shul haqidakim:
            </p>
            <p>
              Ushbu kunga qadar <strong>{customer.name}</strong> tomonidan <strong>«{shopName}»</strong>dan olingan oziq-ovqat va xoʻjalik tovarlari 
              boʻyicha oʻzaro hisob-kitoblar solishtirildi va qoldiq qarz summasi quyidagicha belgilandi:
            </p>
          </div>

          {/* Financial summary table */}
          <div className="bg-white border-2 border-slate-900 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white font-bold text-left">
                <tr>
                  <th className="p-2.5">Koʻrsatkich</th>
                  <th className="p-2.5 text-right">Summasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr>
                  <td className="p-2.5 text-slate-700">Umumiy hisoblangan nasiya xaridlar:</td>
                  <td className="p-2.5 text-right font-black text-slate-900">
                    {formatMoney(customer.balance || 0)}
                  </td>
                </tr>
                {customer.dueDate && (
                  <tr className="bg-amber-50/50">
                    <td className="p-2.5 text-amber-900 font-bold">Kelishilgan oxirgi toʻlov muddati:</td>
                    <td className="p-2.5 text-right font-black text-amber-900">{customer.dueDate}</td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-black">
                  <td className="p-3 text-slate-900 uppercase">JAMI TOʻLANISHI LOZIM BOʻLGAN QARZ:</td>
                  <td className="p-3 text-right text-base text-rose-700">
                    {formatMoney(customer.balance || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legal acknowledgment statement */}
          <div className="p-3 bg-slate-100/80 rounded-xl text-xs text-slate-700 leading-normal border border-slate-200">
            <p className="font-semibold">
              <strong>Xaridor tasdigʻi:</strong> Men, <strong>{customer.name}</strong>, yuqorida koʻrsatilgan <strong>{formatMoney(customer.balance || 0)}</strong> miqdoridagi 
              qarz summasini toʻliq tan olaman va uni kelishilgan muddatda toʻlash majburiyatini oʻz zimmamga olaman.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs sm:text-sm">
            <div className="space-y-4">
              <span className="font-bold text-slate-900 block">Doʻkon egasi:</span>
              <div className="border-b-2 border-slate-800 pb-1 flex justify-between">
                <span>{ownerName}</span>
                <span className="text-slate-400 italic">imzo: ________</span>
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-bold text-slate-900 block">Qarzdor xaridor:</span>
              <div className="border-b-2 border-slate-800 pb-1 flex justify-between">
                <span>{customer.name}</span>
                <span className="text-slate-400 italic">imzo: ________</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 print:hidden">
          <button
            onClick={handleShareTelegram}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Telegramga joʻnatish</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl transition active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Hujjatni chop etish (Print)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
