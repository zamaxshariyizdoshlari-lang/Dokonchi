import React, { useState } from 'react';
import { UserPlus, X, Phone, MapPin, Calendar, FileText, ShieldAlert } from 'lucide-react';

export default function CustomerModal({ isOpen, onClose, onSaveCustomer }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [initialDebt, setInitialDebt] = useState('');
  const [creditLimit, setCreditLimit] = useState('500000');
  const [category, setCategory] = useState('pension');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialDebtNum = parseFloat(initialDebt) || 0;
    const creditLimitNum = parseFloat(creditLimit) || 500000;

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '+998 ',
      address: address.trim() || 'Qishloq',
      balance: initialDebtNum,
      creditLimit: creditLimitNum,
      category: category,
      dueDate: dueDate || '',
      note: note.trim() || '',
      history: initialDebtNum > 0 ? [
        {
          id: `hist-${Date.now()}`,
          date: new Date().toLocaleString('uz-UZ'),
          type: 'debt',
          amount: initialDebtNum,
          description: 'Dastlabki yozilgan qarz'
        }
      ] : []
    };

    onSaveCustomer(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg m-0">
              Yangi Nasiyador kiritish
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              F.I.SH yoki Laqabi / Kasbi *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Rustam aka (Traktorchi)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon raqami
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Toʻlov toifasi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="pension">👵 Pensiya kuni</option>
                <option value="salary">💼 Oylik / Maosh</option>
                <option value="harvest">🌾 Gʻalla / Hosil</option>
                <option value="irregular">🔨 Ish chiqqanda</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Manzili / Koʻchasi
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Masalan: Yangiobod ko'chasi 14"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Credit Limit & Old Debt */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Eski qarzi (boʻlsa)
              </label>
              <input
                type="number"
                value={initialDebt}
                onChange={(e) => setInitialDebt(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Nasiya Limiti *
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="500000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kelishilgan qaytarish sanasi
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Izoh
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Masalan: Har oyning 20-sanasida pensiya oladi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-black shadow-md active:scale-95 transition"
            >
              Daftarga kiritish ✓
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
