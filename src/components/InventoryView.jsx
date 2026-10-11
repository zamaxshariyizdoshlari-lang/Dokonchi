import React, { useState } from 'react';
import {
  Package, Plus, Search, AlertCircle, TrendingUp, Edit2, Check,
  AlertTriangle, ArrowUpDown, DollarSign, Filter
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function InventoryView({ products, onAddProduct, onUpdateStock }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stockEditId, setStockEditId] = useState(null);
  const [stockAddAmount, setStockAddAmount] = useState('');

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Oziq-ovqat',
    costPrice: '',
    price: '',
    unit: 'dona',
    stock: '',
    minStock: 5,
    quickAdd: true
  });

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesLowStock = showLowStockOnly ? p.stock <= p.minStock : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalStockItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price || 0), 0);

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    const created = {
      id: `prod-${Date.now()}`,
      name: newProd.name.trim(),
      category: newProd.category,
      costPrice: parseFloat(newProd.costPrice) || 0,
      price: parseFloat(newProd.price),
      unit: newProd.unit,
      stock: parseInt(newProd.stock) || 0,
      minStock: parseInt(newProd.minStock) || 5,
      quickAdd: Boolean(newProd.quickAdd)
    };

    onAddProduct(created);
    setNewProd({
      name: '',
      category: 'Oziq-ovqat',
      costPrice: '',
      price: '',
      unit: 'dona',
      stock: '',
      minStock: 5,
      quickAdd: true
    });
    setShowAddModal(false);
  };

  const handleStockAdd = (id) => {
    if (!stockAddAmount || isNaN(stockAddAmount)) return;
    const delta = parseInt(stockAddAmount);
    if (delta !== 0) {
      onUpdateStock(id, delta);
    }
    setStockEditId(null);
    setStockAddAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">
              Ombordagi tovarlar qiymati
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatMoney(totalStockValue)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">
              Jami mahsulotlar soni
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {products.length} turdagi ({totalStockItems} dona)
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            showLowStockOnly
              ? 'bg-rose-500 text-white border-rose-600'
              : 'bg-white border-slate-200 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div>
            <p className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${showLowStockOnly ? 'text-white/80' : 'text-rose-600'}`}>
              Tugayotgan tovarlar (Optom kerak)
            </p>
            <h3 className={`text-2xl sm:text-3xl font-black mt-1 ${showLowStockOnly ? 'text-white' : 'text-rose-700'}`}>
              {lowStockCount} ta tovar
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${showLowStockOnly ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter & New Product */}
      <div className="bg-white p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tovarni qidirish..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                showLowStockOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Faqat kam qolganlar</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md active:scale-95 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yangi tovar qoʻshish</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pt-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === c
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c === 'all' ? 'Barcha toifalar' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table/Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-800 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Mahsulot nomi</th>
                <th className="py-3.5 px-3">Toifasi</th>
                <th className="py-3.5 px-3 text-right">Tannarxi</th>
                <th className="py-3.5 px-3 text-right">Sotish narxi</th>
                <th className="py-3.5 px-3 text-center">Qoldiq</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Tezkor toʻldirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((p) => {
                const isLow = p.stock <= p.minStock;
                const margin = p.price - (p.costPrice || 0);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 text-sm sm:text-base">
                        {p.name}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Oʻlchov: {p.unit} {p.barcode ? `• Barcode: ${p.barcode}` : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium text-slate-500">
                      {p.costPrice ? formatMoney(p.costPrice) : '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="font-black text-emerald-700 text-sm sm:text-base">
                        {formatMoney(p.price)}
                      </span>
                      {margin > 0 && (
                        <span className="block text-[11px] text-emerald-600 font-semibold">
                          +{formatMoney(margin)} foyda
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl font-black text-xs sm:text-sm ${
                          isLow
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stock} {p.unit}
                        {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {stockEditId === p.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            autoFocus
                            placeholder="+soni"
                            value={stockAddAmount}
                            onChange={(e) => setStockAddAmount(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                          />
                          <button
                            onClick={() => handleStockAdd(p.id)}
                            className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setStockEditId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded-lg text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateStock(p.id, 5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-extrabold transition text-slate-600"
                            title="5 dona qo'shish"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, 10)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-extrabold transition text-slate-600"
                            title="10 dona qo'shish"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => {
                              setStockEditId(p.id);
                              setStockAddAmount('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Boshqa miqdor kiritish"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Yangi tovar qoʻshish
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mahsulot maʼlumotlarini toʻldiring
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tovar nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="Masalan: Paxta yog'i 5L"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Toifasi
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Non mahsulotlari">Non mahsulotlari</option>
                    <option value="Ichimliklar">Ichimliklar</option>
                    <option value="Choy va qahva">Choy va qahva</option>
                    <option value="Xoʻjalik mollari">Xoʻjalik mollari</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Oʻlchov birligi
                  </label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="dona">dona</option>
                    <option value="kg">kg</option>
                    <option value="qop">qop</option>
                    <option value="litr">litr</option>
                    <option value="pachka">pachka</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tannarxi (Optom narxi)
                  </label>
                  <input
                    type="number"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    placeholder="Masalan: 70000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sotish narxi *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="Masalan: 82000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hozirgi qoldiq soni
                  </label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="Masalan: 20"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ogohlantirish chegarasi
                  </label>
                  <input
                    type="number"
                    value={newProd.minStock}
                    onChange={(e) => setNewProd({ ...newProd, minStock: e.target.value })}
                    placeholder="Masalan: 5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Saqlash ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
