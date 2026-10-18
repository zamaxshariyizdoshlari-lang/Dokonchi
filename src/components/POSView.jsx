import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Minus, Trash2, ShoppingBag, CreditCard, Banknote,
  BookOpen, Sparkles, UserCheck, CheckCircle2, RotateCcw, AlertTriangle,
  Camera, Mic, Calculator, ShieldAlert, DollarSign, ArrowRightLeft,
  X, Check, User, PauseCircle, PlayCircle, Percent, Layers, Scale
} from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function POSView({
  products = [],
  customers = [],
  onCompleteSale,
  onOpenCustomerModal,
  onOpenBarcodeScanner,
  onOpenVoiceAssistant,
  onOpenCalculator,
  onOpenCashPaymentModal,
  onOpenSplitPayment,
  onOpenReturnProduct,
  cart = [],
  setCart = () => {},
  selectedCustomerId: externalCustomerId,
  setSelectedCustomerId: externalSetSelectedCustomerId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [internalCustomerId, setInternalCustomerId] = useState('');
  const [allowOverlimit, setAllowOverlimit] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(null); // null, 'debt-confirm'

  // USD Currency Converter State
  const [showUsdModal, setShowUsdModal] = useState(false);
  const [usdRate, setUsdRate] = useState(12800);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('12800');
  const [usdAmount, setUsdAmount] = useState('');
  const [usdItemTitle, setUsdItemTitle] = useState('');

  // Hold Carts (Pauza / Kutish) State
  const [heldCarts, setHeldCarts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('baraka_held_carts') || '[]');
    } catch {
      return [];
    }
  });
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);

  // Discount State
  const [discountPercent, setDiscountPercent] = useState(0); // 0, 3, 5, 10%

  // Save held carts
  useEffect(() => {
    localStorage.setItem('baraka_held_carts', JSON.stringify(heldCarts));
  }, [heldCarts]);

  // Handle controlled / uncontrolled customer selection
  const selectedCustomerId = externalCustomerId !== undefined ? externalCustomerId : internalCustomerId;
  const setSelectedCustomerId = externalSetSelectedCustomerId || setInternalCustomerId;

  // Selected customer object
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  // Categories
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  // Scale Barcode Parser: (21 PPPPP WWWWW C)
  const handleScaleBarcodeDetection = (code) => {
    if (!code || typeof code !== 'string') return false;
    const trimmed = code.trim();
    if ((trimmed.startsWith('21') || trimmed.startsWith('22')) && trimmed.length === 13) {
      const itemCode = trimmed.slice(2, 7);
      const weightGrams = parseInt(trimmed.slice(7, 12), 10);
      const weightKg = weightGrams / 1000;

      const matchedProduct = products.find(
        (p) => p.barcode && (p.barcode.includes(itemCode) || p.barcode === itemCode)
      );

      if (matchedProduct && weightKg > 0) {
        addToCart(matchedProduct, weightKg);
        setSearchTerm('');
        return true;
      }
    }
    return false;
  };

  // Search input change handler
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    // Check if scale barcode was pasted or scanned
    if (val.length === 13 && (val.startsWith('21') || val.startsWith('22'))) {
      handleScaleBarcodeDetection(val);
    }
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.round((item.quantity + quantity) * 1000) / 1000 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          costPrice: product.costPrice || 0,
          unit: product.unit || 'dona',
          image: product.image || '📦',
          quantity: quantity
        }
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.round((item.quantity + delta) * 1000) / 1000;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomerId('');
    setPaymentStep(null);
    setDiscountPercent(0);
  };

  // Hold current cart
  const handleHoldCurrentCart = () => {
    if (cart.length === 0) return;
    const newHold = {
      id: `hold-${Date.now()}`,
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart],
      total: grossTotal,
      customer: activeCustomer,
      itemsCount: totalItemsCount
    };
    setHeldCarts((prev) => [newHold, ...prev]);
    clearCart();
  };

  // Restore held cart
  const handleRestoreHeldCart = (heldItem) => {
    setCart(heldItem.cart);
    if (heldItem.customer) {
      setSelectedCustomerId(heldItem.customer.id);
    }
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldItem.id));
    setShowHeldCartsModal(false);
  };

  const handleDeleteHeldCart = (heldId) => {
    setHeldCarts((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Add custom unlisted item
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItemPrice || isNaN(customItemPrice)) return;
    const priceNum = parseFloat(customItemPrice);
    const newItem = {
      id: `custom-${Date.now()}`,
      name: customItemName.trim() || 'Boshqa tovar',
      price: priceNum,
      costPrice: priceNum * 0.85,
      unit: 'dona',
      image: '📦',
      quantity: 1
    };
    setCart((prev) => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    setShowCustomModal(false);
  };

  // Add USD item to cart
  const handleAddUsdItem = (e) => {
    e.preventDefault();
    const usdVal = parseFloat(usdAmount);
    if (!usdVal || isNaN(usdVal) || usdVal <= 0) return;

    const somPrice = Math.round(usdVal * usdRate);
    const itemName = usdItemTitle.trim() || `Optom tovar ($${usdVal})`;

    const newItem = {
      id: `usd-${Date.now()}`,
      name: `${itemName} ($${usdVal})`,
      price: somPrice,
      costPrice: somPrice * 0.9,
      unit: 'dona',
      image: '💵',
      quantity: 1
    };

    setCart((prev) => [...prev, newItem]);
    setUsdAmount('');
    setUsdItemTitle('');
    setShowUsdModal(false);
  };

  const handleUpdateRate = () => {
    const parsed = parseFloat(rateInput);
    if (parsed && !isNaN(parsed) && parsed > 0) {
      setUsdRate(parsed);
      setIsEditingRate(false);
    }
  };

  // Financial calculations
  const grossTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = discountPercent > 0 ? Math.round((grossTotal * discountPercent) / 100 / 500) * 500 : 0;
  const netTotal = Math.max(0, grossTotal - discountAmount);
  const cartTotalUsd = (netTotal / usdRate).toFixed(2);

  // Complete Checkout
  const handleCheckout = (paymentMethod) => {
    if (cart.length === 0) return;

    if (paymentMethod === 'debt') {
      if (!selectedCustomerId) {
        setPaymentStep('debt-confirm');
        return;
      }

      const customer = customers.find((c) => c.id === selectedCustomerId);
      onCompleteSale({
        cart,
        total: netTotal,
        paymentMethod: 'debt',
        customer: customer
      });
      clearCart();
      return;
    }

    // Cash or Card
    onCompleteSale({
      cart,
      total: netTotal,
      paymentMethod,
      customer: activeCustomer || null
    });
    clearCart();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Products Grid & Quick Buttons (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Top Bar: Search, Scanner, Mic, Calculator, USD, Vozvrat, and Custom Item */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tovarni qidirish yoki tarozi kodi (21...)..."
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-base font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Helper Tools */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              
              {/* 1. Barcode Camera Scanner */}
              <button
                onClick={onOpenBarcodeScanner}
                title="Kamera orqali shtrix-kod & Nasiya kartasi skaneri"
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Skaner</span>
              </button>

              {/* 4. Voice Assistant Mic */}
              <button
                onClick={onOpenVoiceAssistant}
                title="Ovoz bilan tovar/qarz yozish"
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl font-bold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <Mic className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Ovozli</span>
              </button>

              {/* 6. Calculator */}
              <button
                onClick={onOpenCalculator}
                title="Kassa Kalkulyatori"
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-xl font-bold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <Calculator className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">Kalkulyator</span>
              </button>

              {/* Vozvrat (Tovar qaytarish) */}
              <button
                onClick={onOpenReturnProduct}
                title="Tovarni qaytarib olish (Vozvrat)"
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-xl font-extrabold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 text-rose-700" />
                <span className="hidden sm:inline">Vozvrat</span>
              </button>

              {/* USD Currency Converter Widget */}
              <button
                onClick={() => setShowUsdModal(true)}
                title="Valyuta konverteri"
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-xl font-extrabold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <DollarSign className="w-4 h-4 text-teal-700" />
                <span>${Number(usdRate).toLocaleString()}</span>
              </button>

              {/* Custom Item */}
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs sm:text-sm transition active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-amber-600 stroke-[3]" />
                <span className="hidden xl:inline">Roʻyxatda yoʻq</span>
              </button>

            </div>

          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'Barcha tovarlar' : cat}
              </button>
            ))}
          </div>

          {/* Products Grid with Visual Images/Emojis */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.id === product.id);
              const isLow = product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product, 1)}
                  className={`group bg-white rounded-2xl p-3 sm:p-4 border transition-all cursor-pointer select-none flex flex-col justify-between active:scale-[0.98] shadow-xs hover:shadow-md ${
                    inCart
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Product Icon Badge & Stock Unit */}
                    <div className="flex items-start justify-between gap-1.5 mb-2">
                      <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition shrink-0">
                        {product.image || '📦'}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          {product.unit}
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-100 text-rose-700">
                            Qoldiq: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 font-extrabold text-sm sm:text-base">
                        {formatMoney(product.price)}
                      </p>
                    </div>

                    {inCart ? (
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {inCart.quantity}
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white font-bold text-xs flex items-center justify-center transition">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">Bunday tovar topilmadi</p>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  Yangi tovar sifatida kiritish
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-36">
          <div className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[560px]">
            
            {/* Cart Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-sm sm:text-base text-white m-0">Savatdagi tovarlar</h2>
              </div>
              
              <div className="flex items-center gap-1.5">
                {/* Hold/Suspend Cart Button */}
                <button
                  disabled={cart.length === 0}
                  onClick={handleHoldCurrentCart}
                  title="Savatni kutishga qoʻyish (Pauza)"
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-amber-400 transition disabled:opacity-30"
                >
                  <PauseCircle className="w-5 h-5" />
                </button>

                {/* Held Carts Badge Trigger */}
                {heldCarts.length > 0 && (
                  <button
                    onClick={() => setShowHeldCartsModal(true)}
                    className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition animate-pulse"
                    title="Kutayotgan savatlar"
                  >
                    Kutishda: {heldCarts.length}
                  </button>
                )}

                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg">
                  {totalItemsCount} ta
                </span>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    title="Savatni tozalash"
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Attached / Scanned Customer Banner */}
            {activeCustomer && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-extrabold text-xs text-amber-950 truncate">
                      {activeCustomer.name}
                    </span>
                    <span className="text-[10px] text-amber-600 font-black">
                      {'★'.repeat(activeCustomer.rating || 5)}
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 mt-0.5">
                    Qarzi: <strong>{formatMoney(activeCustomer.balance)}</strong> • Bonus: <strong>{formatMoney(activeCustomer.cashback || 0)}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomerId('')}
                  className="text-[10px] font-bold text-slate-500 hover:text-rose-600 px-1.5 py-0.5 rounded bg-amber-100 hover:bg-rose-100"
                  title="Xaridorni ajratish"
                >
                  Ajratish ✕
                </button>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-600 text-base mb-1">Savat boʻsh</p>
                  <p className="text-xs text-slate-400">
                    Chap tarafdagi tovarlarni bosib, savatga qoʻshing
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    
                    {/* Item Image & Title */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <span className="text-xl shrink-0 p-1 bg-slate-50 rounded-lg">
                        {item.image || '📦'}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500">
                          {formatMoney(item.price)} × {item.quantity} {item.unit}
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 active:scale-95 font-bold text-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-extrabold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 font-bold text-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right w-20">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Checkout Panel */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-2.5">
              
              {/* Discount Selector */}
              {cart.length > 0 && (
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-rose-600" />
                    Chegirma:
                  </span>
                  <div className="flex items-center gap-1">
                    {[0, 3, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercent(pct)}
                        className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
                          discountPercent === pct
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {pct === 0 ? 'Yoʻq' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary with USD Equivalent */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600">Jami toʻlov:</span>
                  {discountAmount > 0 && (
                    <span className="block text-[10px] font-bold text-rose-600 line-through">
                      {formatMoney(grossTotal)} (-{formatMoney(discountAmount)})
                    </span>
                  )}
                  <span className="block text-[10px] font-black text-teal-700">
                    ≈ ${cartTotalUsd} USD
                  </span>
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatMoney(netTotal)}
                </span>
              </div>

              {/* Debt Customer Selector Mode if triggered */}
              {paymentStep === 'debt-confirm' && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      Nasiyador mahalla aʼzosini tanlang:
                    </span>
                    <button
                      onClick={() => setPaymentStep(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Bekor qilish
                    </button>
                  </div>

                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">-- Roʻyxatdan tanlang --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatMoney(c.balance)} qarzi bor)
                      </option>
                    ))}
                  </select>

                  {/* Credit Limit Exceeded Warning */}
                  {(() => {
                    const selectedCust = customers.find((c) => c.id === selectedCustomerId);
                    if (!selectedCust) return null;
                    const newTotalDebt = (selectedCust.balance || 0) + netTotal;
                    const limit = selectedCust.creditLimit || 500000;
                    const isExceeded = newTotalDebt > limit;

                    if (isExceeded) {
                      return (
                        <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5 text-xs text-rose-900 animate-pulse">
                          <div className="flex items-start gap-1.5 font-bold">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>⚠️ Qarz limiti oshib ketmoqda!</span>
                          </div>
                          <p className="text-[11px] text-rose-700">
                            Limit: <strong>{formatMoney(limit)}</strong> • Yangi qarz: <strong className="text-rose-900">{formatMoney(newTotalDebt)}</strong>
                          </p>
                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={allowOverlimit}
                              onChange={(e) => setAllowOverlimit(e.target.checked)}
                              className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            <span>Shunga qaramay qarzga ruxsat berish</span>
                          </label>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={onOpenCustomerModal}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      + Yangi odam qoʻshish
                    </button>

                    {(() => {
                      const selectedCust = customers.find((c) => c.id === selectedCustomerId);
                      const newTotalDebt = (selectedCust?.balance || 0) + netTotal;
                      const limit = selectedCust?.creditLimit || 500000;
                      const isExceeded = selectedCust && newTotalDebt > limit;
                      const canSubmit = selectedCustomerId && (!isExceeded || allowOverlimit);

                      return (
                        <button
                          disabled={!canSubmit}
                          onClick={() => handleCheckout('debt')}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-sm ${
                            canSubmit
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer active:scale-95'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Daftarga yozish ✓
                        </button>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Main 4 Action Buttons: Naqd, Karta, Nasiya, and Aralash */}
              {paymentStep !== 'debt-confirm' && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  
                  {/* Cash */}
                  <button
                    disabled={cart.length === 0}
                    onClick={() => {
                      if (onOpenCashPaymentModal) {
                        onOpenCashPaymentModal();
                      } else {
                        handleCheckout('cash');
                      }
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-emerald-600/20"
                  >
                    <Banknote className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-extrabold">Naqd</span>
                  </button>

                  {/* Card */}
                  <button
                    disabled={cart.length === 0}
                    onClick={() => handleCheckout('card')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-sky-600/20"
                  >
                    <CreditCard className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-extrabold">Karta</span>
                  </button>

                  {/* Debt / Nasiya */}
                  <button
                    disabled={cart.length === 0}
                    onClick={() => setPaymentStep('debt-confirm')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-amber-500/25"
                  >
                    <BookOpen className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-extrabold">Nasiya</span>
                  </button>

                  {/* Aralash to'lov (Split) */}
                  <button
                    disabled={cart.length === 0}
                    onClick={onOpenSplitPayment}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-purple-600/20"
                    title="Aralash toʻlov (Naqd + Karta + Qarz)"
                  >
                    <Layers className="w-4 h-4 mb-1" />
                    <span className="text-[11px] font-extrabold">Aralash</span>
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Modal 1: Adding unlisted custom product */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Roʻyxatda yoʻq tovar kiritish
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Masalan: qovun, tarvuz, yangi sabzavot yoki maxsus buyurtma
            </p>

            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tovar nomi (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="Masalan: Tarvuz yoki Qaymoq"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Narxi (soʻmda) *
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  placeholder="Masalan: 15000"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Savatga qoʻshish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: USD Currency Converter */}
      {showUsdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base m-0">
                    Valyuta kursi & Konverter
                  </h3>
                  <p className="text-[11px] text-slate-500 m-0">
                    Optom tovarlar (un, yem, koʻmir) uchun
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUsdModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Current Rate & Edit Mode */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-teal-900">
                  Hozirgi USD kursi:
                </span>
                {!isEditingRate ? (
                  <button
                    onClick={() => {
                      setRateInput(usdRate.toString());
                      setIsEditingRate(true);
                    }}
                    className="text-[11px] font-bold text-teal-700 underline"
                  >
                    Oʻzgartirish
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateRate}
                    className="text-[11px] font-extrabold text-teal-900 bg-teal-200 px-2 py-0.5 rounded"
                  >
                    Saqlash ✓
                  </button>
                )}
              </div>

              {!isEditingRate ? (
                <div className="text-lg font-black text-teal-950">
                  1 USD = {Number(usdRate).toLocaleString()} soʻm
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-teal-800">1$ =</span>
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-sm font-bold bg-white border border-teal-300 rounded-lg text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <span className="text-xs font-bold text-teal-800">soʻm</span>
                </div>
              )}
            </div>

            {/* Convert & Add to Cart Form */}
            <form onSubmit={handleAddUsdItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tovar nomi (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={usdItemTitle}
                  onChange={(e) => setUsdItemTitle(e.target.value)}
                  placeholder="Masalan: 50kg Qozoq uni yoki Koʻmir"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Narxi dollarda ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    autoFocus
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    placeholder="Masalan: 20"
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-lg font-black text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {usdAmount && !isNaN(usdAmount) && parseFloat(usdAmount) > 0 && (
                <div className="p-3 bg-slate-900 text-white rounded-xl text-center space-y-0.5 animate-in fade-in">
                  <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">
                    Soʻmdagi qiymati:
                  </span>
                  <p className="text-xl font-black text-teal-400">
                    {formatMoney(Math.round(parseFloat(usdAmount) * usdRate))}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUsdModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={!usdAmount || isNaN(usdAmount)}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
                >
                  + Savatga qoʻshish
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 3: Held / Suspended Carts (Pauza qilingan savatlar) */}
      {showHeldCartsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <PauseCircle className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base m-0">
                    Kutayotgan savatlar (Pauza)
                  </h3>
                  <p className="text-[11px] text-slate-500 m-0">
                    Boshqa xaridor kelganda vaqtincha saqlangan savatlar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHeldCartsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {heldCarts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Kutishda hech qanday savat yoʻq
                </div>
              ) : (
                heldCarts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 truncate">
                        <span>{item.customer ? item.customer.name : 'Nomaʼlum xaridor'}</span>
                        <span className="text-[10px] font-normal text-slate-400">({item.time})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.itemsCount} ta tovar • {formatMoney(item.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestoreHeldCart(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                      >
                        Tiklash
                      </button>
                      <button
                        onClick={() => handleDeleteHeldCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHeldCartsModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
