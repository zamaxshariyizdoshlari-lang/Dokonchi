import React, { useState } from 'react';
import {
  Package, Plus, Trash2, Edit2, Download, Upload, Sparkles, Tag,
  Truck, AlertOctagon, TrendingUp, DollarSign, Shield, ArrowLeft,
  Search, Check, AlertTriangle, RefreshCw, Calendar, Phone, Building,
  FileSpreadsheet, ArrowUpRight, ArrowDownRight, CheckCircle2
} from 'lucide-react';
import { formatMoney, exportProductsToCSV } from '../utils/storage';
import { STANDARD_UZBEK_CATALOG } from '../data/standardCatalog';

export default function AdminPanel({
  products,
  suppliers,
  writeOffs,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddProducts,
  onAddSupplier,
  onSupplierPayment,
  onSupplierDelivery,
  onAddWriteOff,
  onSaveSettings,
  onSwitchToCashier,
  onOpenBarcodeLabel
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'catalog_import', 'suppliers', 'writeoffs', 'security'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal / Form states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showSupplierPaymentModal, setShowSupplierPaymentModal] = useState(null);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);

  // Form states
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Oziq-ovqat',
    costPrice: '',
    price: '',
    unit: 'dona',
    stock: '',
    minStock: 5,
    barcode: ''
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    company: '',
    phone: '+998 ',
    products: '',
    ourDebt: '',
    dueDate: ''
  });

  const [supplierPayAmount, setSupplierPayAmount] = useState('');
  const [supplierPayNote, setSupplierPayNote] = useState('');

  const [writeOffForm, setWriteOffForm] = useState({
    productId: '',
    quantity: '1',
    reason: 'Muddati oʻtgan'
  });

  const [newPin, setNewPin] = useState(settings.adminPin || '7777');
  const [pinSaved, setPinSaved] = useState(false);

  // Bulk Price adjustment state
  const [showPriceAdjust, setShowPriceAdjust] = useState(false);
  const [priceAdjustPercent, setPriceAdjustPercent] = useState('5');

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Financial aggregates
  const totalStockCost = products.reduce((sum, p) => sum + (p.stock || 0) * (p.costPrice || 0), 0);
  const totalStockSaleValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0);
  const totalPotentialProfit = totalStockSaleValue - totalStockCost;
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + (s.ourDebt || 0), 0);
  const totalLossFromWriteOffs = writeOffs.reduce((sum, w) => sum + (w.costLoss || 0), 0);

  // Load Standard Uzbek Catalog
  const handleLoadStandardCatalog = () => {
    const existingNames = new Set(products.map((p) => p.name.toLowerCase().trim()));
    const itemsToAdd = [];

    STANDARD_UZBEK_CATALOG.forEach((item) => {
      if (!existingNames.has(item.name.toLowerCase().trim())) {
        itemsToAdd.push({
          id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...item
        });
      }
    });

    if (itemsToAdd.length === 0) {
      alert('Barcha standart tovarlar allaqachon bazangizda mavjud!');
      return;
    }

    onBulkAddProducts(itemsToAdd);
    alert(`✓ ${itemsToAdd.length} ta yangi standart tovar muvaffaqiyatli yuklandi!`);
  };

  // Mass price adjust
  const handleMassPriceAdjust = (increase = true) => {
    const pct = parseFloat(priceAdjustPercent) || 5;
    const factor = increase ? 1 + pct / 100 : 1 - pct / 100;

    const updated = products.map((p) => ({
      ...p,
      price: Math.round((p.price * factor) / 500) * 500 // round to nearest 500 so'm
    }));

    onBulkAddProducts(updated, true); // replace/update
    setShowPriceAdjust(false);
    alert(`Barcha tovarlar narxi ${increase ? '+' : '-'}${pct}% ga yangilandi!`);
  };

  // Product CRUD
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: newProd.name.trim(),
        category: newProd.category,
        costPrice: parseFloat(newProd.costPrice) || 0,
        price: parseFloat(newProd.price),
        unit: newProd.unit,
        image: newProd.image || editingProduct.image || '📦',
        stock: parseInt(newProd.stock) || 0,
        minStock: parseInt(newProd.minStock) || 5,
        barcode: newProd.barcode.trim() || editingProduct.barcode || `BAQ-${Date.now().toString().slice(-6)}`
      });
      setEditingProduct(null);
    } else {
      const created = {
        id: `prod-${Date.now()}`,
        name: newProd.name.trim(),
        category: newProd.category,
        costPrice: parseFloat(newProd.costPrice) || 0,
        price: parseFloat(newProd.price),
        unit: newProd.unit,
        image: newProd.image || '📦',
        stock: parseInt(newProd.stock) || 0,
        minStock: parseInt(newProd.minStock) || 5,
        barcode: newProd.barcode.trim() || `BAQ-${Date.now().toString().slice(-6)}`
      };
      onAddProduct(created);
    }

    setShowAddProductModal(false);
    setNewProd({
      name: '',
      category: 'Oziq-ovqat',
      costPrice: '',
      price: '',
      unit: 'dona',
      image: '📦',
      stock: '',
      minStock: 5,
      barcode: ''
    });
  };

  const startEditProduct = (p) => {
    setEditingProduct(p);
    setNewProd({
      name: p.name,
      category: p.category,
      costPrice: p.costPrice || '',
      price: p.price,
      unit: p.unit,
      image: p.image || '📦',
      stock: p.stock,
      minStock: p.minStock || 5,
      barcode: p.barcode || ''
    });
    setShowAddProductModal(true);
  };

  // Supplier CRUD
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.name.trim()) return;

    const supp = {
      id: `supp-${Date.now()}`,
      name: newSupplier.name.trim(),
      company: newSupplier.company.trim() || 'Optom Taʼminot',
      phone: newSupplier.phone.trim() || '+998 ',
      products: newSupplier.products.trim() || 'Oziq-ovqat',
      ourDebt: parseFloat(newSupplier.ourDebt) || 0,
      dueDate: newSupplier.dueDate || '',
      history: []
    };

    onAddSupplier(supp);
    setShowSupplierModal(false);
    setNewSupplier({
      name: '',
      company: '',
      phone: '+998 ',
      products: '',
      ourDebt: '',
      dueDate: ''
    });
  };

  const handlePaySupplier = (e) => {
    e.preventDefault();
    if (!supplierPayAmount || isNaN(supplierPayAmount) || !showSupplierPaymentModal) return;
    const amount = parseFloat(supplierPayAmount);
    if (amount <= 0) return;

    onSupplierPayment(showSupplierPaymentModal.id, amount, supplierPayNote || 'Optomchiga qarz toʻlandi');
    setSupplierPayAmount('');
    setSupplierPayNote('');
    setShowSupplierPaymentModal(null);
  };

  // Write-off (Spisanie) Submit
  const handleSaveWriteOff = (e) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === writeOffForm.productId);
    if (!prod) return;

    const qty = parseInt(writeOffForm.quantity) || 1;
    const loss = (prod.costPrice || prod.price * 0.8) * qty;

    const writeOffItem = {
      id: `wo-${Date.now()}`,
      date: new Date().toLocaleString('uz-UZ'),
      productName: prod.name,
      quantity: qty,
      unit: prod.unit,
      costLoss: loss,
      reason: writeOffForm.reason
    };

    onAddWriteOff(writeOffItem, prod.id, qty);
    setShowWriteOffModal(false);
    setWriteOffForm({ productId: '', quantity: '1', reason: 'Muddati oʻtgan' });
  };

  // Save PIN
  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      alert('PIN-kod 4 ta raqamdan iborat boʻlishi kerak!');
      return;
    }
    onSaveSettings({ ...settings, adminPin: newPin });
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white m-0 tracking-tight">
                Doʻkon Egasi Admin Paneli
              </h2>
              <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                Himoyalangan
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tovarlar bazasi, optomchilar va xavfsizlik sozlamalari
            </p>
          </div>
        </div>

        {/* Switch back to cashier */}
        <button
          onClick={onSwitchToCashier}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs sm:text-sm font-extrabold border border-slate-700 transition active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sotuvchi rejimiga qaytish</span>
        </button>
      </div>

      {/* Top KPI Aggregates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Ombordagi tovarlar tannarxi
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {formatMoney(totalStockCost)}
          </div>
          <span className="text-[10px] text-slate-400">Doʻkondagi sof investitsiya</span>
        </div>

        <div className="p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
            Kutilayotgan sof foyda
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            +{formatMoney(totalPotentialProfit)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Tannarx va sotish farqi</span>
        </div>

        <div className="p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
            Optomchilarga qarzimiz
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
            {formatMoney(totalSupplierDebt)}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">{suppliers.length} ta taʼminotchi oldida</span>
        </div>

        <div className="p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wide">
            Brak / Hisobdan chiqarilgan
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            {formatMoney(totalLossFromWriteOffs)}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold">{writeOffs.length} ta holat</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Tovarlar Nazorati ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog_import')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition ${
            activeTab === 'catalog_import'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Tayyor Baqqol Bazasi & Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition ${
            activeTab === 'suppliers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4 text-sky-400" />
          <span>Optomchilar & Bizning Qarzlar ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('writeoffs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition ${
            activeTab === 'writeoffs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-rose-500" />
          <span>Brak & Hisobdan Chiqarish ({writeOffs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition ${
            activeTab === 'security'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>PIN-kod & Xavfsizlik</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Actions top bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nomi yoki shtrix-kodi boʻyicha qidirish..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPriceAdjust(!showPriceAdjust)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ommaviy narx oʻzgartirish</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProd({
                    name: '',
                    category: 'Oziq-ovqat',
                    costPrice: '',
                    price: '',
                    unit: 'dona',
                    stock: '',
                    minStock: 5,
                    barcode: ''
                  });
                  setShowAddProductModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Yangi tovar qoʻshish</span>
              </button>
            </div>
          </div>

          {/* Mass price adjustment drawer */}
          {showPriceAdjust && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900">
                  Barcha tovarlar sotish narxini foizga oʻzgartirish:
                </span>
                <input
                  type="number"
                  value={priceAdjustPercent}
                  onChange={(e) => setPriceAdjustPercent(e.target.value)}
                  className="w-16 p-1.5 bg-white border border-amber-300 rounded-lg text-center font-black"
                />
                <span className="font-bold text-amber-900">%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMassPriceAdjust(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-xs"
                >
                  +{priceAdjustPercent}% Oshirish
                </button>
                <button
                  onClick={() => handleMassPriceAdjust(false)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg shadow-xs"
                >
                  -{priceAdjustPercent}% Tushirish
                </button>
                <button
                  onClick={() => setShowPriceAdjust(false)}
                  className="px-2 py-1 text-slate-500 font-bold hover:text-slate-800"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Tovar nomi & Shtrix-kod</th>
                    <th className="py-3 px-3">Toifasi</th>
                    <th className="py-3 px-3 text-right">Tannarx (Optom)</th>
                    <th className="py-3 px-3 text-right">Sotish narxi</th>
                    <th className="py-3 px-3 text-center">Foyda marjasi</th>
                    <th className="py-3 px-3 text-center">Qoldiq</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => {
                    const margin = p.price - (p.costPrice || 0);
                    const marginPercent = p.costPrice > 0 ? Math.round((margin / p.costPrice) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                              {p.image || '📦'}
                            </span>
                            <div>
                              <div className="font-black text-slate-900 text-sm">{p.name}</div>
                              <span className="text-[11px] font-mono text-slate-400">
                                {p.barcode || 'Shtrix-kod yoʻq'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {p.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-slate-500">
                          {p.costPrice ? formatMoney(p.costPrice) : '—'}
                        </td>

                        <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm">
                          {formatMoney(p.price)}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {margin > 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                              +{marginPercent}% ({formatMoney(margin)})
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center font-bold">
                          <span className={p.stock <= (p.minStock || 5) ? 'text-rose-600 font-black' : 'text-slate-800'}>
                            {p.stock} {p.unit}
                          </span>
                        </td>

                        <td className="py-3 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Barcode label print */}
                            <button
                              onClick={() => onOpenBarcodeLabel(p)}
                              title="Shtrix-kod stikerini chiqarish"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <Tag className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => startEditProduct(p)}
                              title="Tahrirlash"
                              className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`"${p.name}" tovarini oʻchirishga ishonchingiz komilmi?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              title="Oʻchirish"
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: READY STANDARD CATALOG & EXCEL IMPORT/EXPORT */}
      {/* ============================================================== */}
      {activeTab === 'catalog_import' && (
        <div className="space-y-6">
          
          {/* Card 1: 1-Click Load 45+ Standard Village items */}
          <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl shadow-lg border border-emerald-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-300" />
                <h3 className="text-lg font-black text-white m-0">
                  «Oʻzbekiston Baqqol Standart Bazasi» (45+ Tovar)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
                Barcha eng ommabop qishloq tovarlari (Un qoplari, Yogʻlar, Shakar, Choy 95, Makaron, Sigaret, Ichimliklar, Xoʻjalik sovunlari) tayyor narxlari va shtrix-kodlari bilan bir zumda bazangizga qoʻshiladi!
              </p>
            </div>

            <button
              onClick={handleLoadStandardCatalog}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md active:scale-95 transition whitespace-nowrap"
            >
              ⚡️ Baza tovarlarini bir bosishda yuklash
            </button>
          </div>

          {/* Card 2: Excel & CSV Export/Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Export */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base m-0">
                Excel / CSV formatida yuklab olish
              </h4>
              <p className="text-xs text-slate-500">
                Barcha tovarlaringiz (nomi, tannarxi, sotish narxi, qoldigʻi va shtrix-kodi) Excelda ochiladigan `.csv` fayl qilib yuklanadi.
              </p>
              <button
                onClick={() => exportProductsToCSV(products)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Tovarlar jadvalini Excelda yuklab olish</span>
              </button>
            </div>

            {/* Import */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base m-0">
                Excel / CSV fayldan tovarlarni kiritish
              </h4>
              <p className="text-xs text-slate-500">
                Kompyuteringizdagi tayyor tovarlar roʻyxatini yuklang. Tizim avtomatik barcha qatorlarni oʻqib bazaga qoʻshadi.
              </p>
              <label className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm active:scale-95">
                <Upload className="w-4 h-4" />
                <span>Excel / CSV faylni tanlash</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      try {
                        const text = evt.target.result;
                        const lines = text.split('\n');
                        const imported = [];
                        for (let i = 1; i < lines.length; i++) {
                          const line = lines[i].trim();
                          if (!line) continue;
                          const parts = line.split(',');
                          if (parts.length >= 4) {
                            imported.push({
                              id: `prod-${Date.now()}-${i}`,
                              name: parts[0].replace(/"/g, '').trim(),
                              category: (parts[1] || 'Oziq-ovqat').replace(/"/g, '').trim(),
                              costPrice: parseFloat(parts[2]) || 0,
                              price: parseFloat(parts[3]) || 0,
                              unit: (parts[4] || 'dona').replace(/"/g, '').trim(),
                              stock: parseInt(parts[5]) || 0,
                              minStock: 5,
                              barcode: parts[7] ? parts[7].replace(/"/g, '').trim() : `BAQ-${Date.now()}`
                            });
                          }
                        }
                        if (imported.length > 0) {
                          onBulkAddProducts(imported);
                          alert(`✓ ${imported.length} ta tovar muvaffaqiyatli import qilindi!`);
                        }
                      } catch (err) {
                        alert('Faylni oʻqishda xatolik yuz berdi!');
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SUPPLIERS & OUR DEBTS */}
      {/* ============================================================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Optomchilar & Bizning Qarzlarimiz
              </h3>
              <p className="text-xs text-slate-500">
                Taʼminotchilar bilan oʻzaro hisob-kitoblar daftari
              </p>
            </div>

            <button
              onClick={() => setShowSupplierModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi Taʼminotchi qoʻshish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-snug">{s.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{s.company}</p>
                    </div>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg">
                      {s.products}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-500">Bizning qarzimiz:</span>
                    <span className={`text-lg font-black ${s.ourDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatMoney(s.ourDebt)}
                    </span>
                  </div>

                  {s.dueDate && s.ourDebt > 0 && (
                    <p className="text-[11px] text-amber-800 font-semibold mt-1">
                      📅 Toʻlash muddati: {s.dueDate}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  {s.ourDebt > 0 && (
                    <button
                      onClick={() => setShowSupplierPaymentModal(s)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition"
                    >
                      Qarzni toʻlash ✓
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const amount = prompt(`"${s.name}"dan qancha so'mlik yangi tovar keltirildi?`);
                      if (amount && !isNaN(amount)) {
                        onSupplierDelivery(s.id, parseFloat(amount), 'Yangi tovar keltirildi');
                      }
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    + Tovar olindi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: WRITEOFFS & LOSS (SPISANIE) */}
      {/* ============================================================== */}
      {activeTab === 'writeoffs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">
                Brak & Hisobdan Chiqarilgan Tovarlar (Spisanie)
              </h3>
              <p className="text-xs text-slate-500">
                Muddati oʻtgan, singan yoki yaroqsiz tovarlar nazorati
              </p>
            </div>

            <button
              onClick={() => setShowWriteOffModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Brak / Hisobdan chiqarish</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-800 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Sana & Vaqt</th>
                    <th className="py-3 px-3">Mahsulot nomi</th>
                    <th className="py-3 px-3 text-center">Miqdori</th>
                    <th className="py-3 px-3">Sababi</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Zarar miqdori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {writeOffs.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 sm:px-6 font-mono text-slate-500 text-xs">
                        {w.date}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {w.productName}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        {w.quantity} {w.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold">
                          {w.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right font-black text-rose-700">
                        -{formatMoney(w.costLoss)}
                      </td>
                    </tr>
                  ))}
                  {writeOffs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Hozircha hisobdan chiqarilgan tovarlar yoʻq
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SECURITY & ADMIN PIN */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md mx-auto shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base m-0">Admin Xavfsizlik PIN-kodi</h3>
              <p className="text-xs text-slate-500">
                Sotuvchilar admin paneliga kira olmasligi uchun PIN-kodni oʻzgartiring
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yangi 4 xonali PIN-kod:
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="7777"
                className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95"
            >
              PIN-kodni yangilash ✓
            </button>

            {pinSaved && (
              <p className="text-center text-xs font-bold text-emerald-600 mt-2">
                ✓ PIN-kod muvaffaqiyatli saqlandi!
              </p>
            )}
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingProduct ? 'Tovarni Tahrirlash' : 'Yangi Tovar Qoʻshish'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tovar maʼlumotlarini toʻldiring
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Product Icon / Emoji Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tovar belgisi / Emojisi
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 shrink-0">
                    {newProd.image || '📦'}
                  </span>
                  <input
                    type="text"
                    value={newProd.image || ''}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    placeholder="Belgi yoki emoji (masalan: 🌾)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  {['🌾', '🫗', '🌻', '🧊', '🥖', '🍞', '🥩', '🥛', '🧈', '🧀', '🍬', '🍫', '☕', '🍵', '🥤', '💧', '🧼', '🧴', '🍎', '🥔', '🥚', '🧂', '🔥', '🕯', '🪥', '📦'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProd({ ...newProd, image: emoji })}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition active:scale-95 ${
                        newProd.image === emoji ? 'bg-emerald-200 ring-2 ring-emerald-500' : 'hover:bg-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Toifasi
                  </label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Oziq-ovqat">Oziq-ovqat</option>
                    <option value="Un va don">Un va don</option>
                    <option value="Yogʻ mahsulotlari">Yogʻ mahsulotlari</option>
                    <option value="Non mahsulotlari">Non mahsulotlari</option>
                    <option value="Ichimliklar">Ichimliklar</option>
                    <option value="Choy va qahva">Choy va qahva</option>
                    <option value="Qandolat">Qandolat</option>
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
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="dona">dona</option>
                    <option value="kg">kg</option>
                    <option value="qop">qop</option>
                    <option value="litr">litr</option>
                    <option value="pachka">pachka</option>
                    <option value="blok">blok</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tannarxi (Optom)
                  </label>
                  <input
                    type="number"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: e.target.value })}
                    placeholder="72000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="82000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hozirgi qoldiq
                  </label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shtrix-kod (boʻlsa)
                </label>
                <input
                  type="text"
                  value={newProd.barcode}
                  onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                  placeholder="Masalan: 478001234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md"
                >
                  Saqlash ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD SUPPLIER */}
      {/* ============================================================== */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Yangi Taʼminotchi</h3>
            <p className="text-xs text-slate-500 mb-4">Optomchi maʼlumotlari</p>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ismi / Masʼul *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="Masalan: Baxtiyor aka (Unchi)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firma / Bozor nomi</label>
                <input
                  type="text"
                  value={newSupplier.company}
                  onChange={(e) => setNewSupplier({ ...newSupplier, company: e.target.value })}
                  placeholder="Masalan: Qoʻqon Un Bozori"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon raqami</label>
                <input
                  type="text"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qarzimiz (boʻlsa)</label>
                  <input
                    type="number"
                    value={newSupplier.ourDebt}
                    onChange={(e) => setNewSupplier({ ...newSupplier, ourDebt: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Toʻlov sanasi</label>
                  <input
                    type="date"
                    value={newSupplier.dueDate}
                    onChange={(e) => setNewSupplier({ ...newSupplier, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Saqlash ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PAY SUPPLIER DEBT */}
      {/* ============================================================== */}
      {showSupplierPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Optomchiga Qarz Toʻlash</h3>
            <p className="text-xs text-slate-500 mb-4">
              Taʼminotchi: <strong>{showSupplierPaymentModal.name}</strong> • Qarzimiz: <strong className="text-amber-700">{formatMoney(showSupplierPaymentModal.ourDebt)}</strong>
            </p>

            <form onSubmit={handlePaySupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Toʻlanayotgan summa (soʻm) *</label>
                <input
                  type="number"
                  required
                  autoFocus
                  max={showSupplierPaymentModal.ourDebt}
                  value={supplierPayAmount}
                  onChange={(e) => setSupplierPayAmount(e.target.value)}
                  placeholder="Masalan: 500000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Izoh / Toʻlov shakli</label>
                <input
                  type="text"
                  value={supplierPayNote}
                  onChange={(e) => setSupplierPayNote(e.target.value)}
                  placeholder="Masalan: Haydovchisi orqali berildi yoki Click"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierPaymentModal(null)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Toʻlandi ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: WRITE-OFF (SPISANIE) */}
      {/* ============================================================== */}
      {showWriteOffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Brak / Hisobdan Chiqarish</h3>
            <p className="text-xs text-slate-500 mb-4">Ombordan yaroqsiz tovarni kamaytirish</p>

            <form onSubmit={handleSaveWriteOff} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tovarni tanlang *</label>
                <select
                  required
                  value={writeOffForm.productId}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, productId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="">-- Tovarni tanlang --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stock} {p.unit} qoldiq)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Soni / Miqdori *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={writeOffForm.quantity}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, quantity: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sababi *</label>
                <select
                  value={writeOffForm.reason}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, reason: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="Muddati oʻtgan">Muddati oʻtgan (Eskirgan)</option>
                  <option value="Singan / Qadoq yirtilgan">Singan / Qadoq yirtilgan</option>
                  <option value="Sifati buzilgan / Achigan">Sifati buzilgan / Achigan</option>
                  <option value="Optomchiga qaytarildi (Vozvrat)">Optomchiga qaytarildi (Vozvrat)</option>
                  <option value="Boshqa sabab">Boshqa sabab</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteOffModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Hisobdan chiqarish ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
