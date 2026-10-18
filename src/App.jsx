import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import POSView from './components/POSView';
import DebtBookView from './components/DebtBookView';
import InventoryView from './components/InventoryView';
import ReportsView from './components/ReportsView';
import AdminPanel from './components/AdminPanel';
import AdminPinModal from './components/AdminPinModal';
import BarcodeLabelModal from './components/BarcodeLabelModal';
import CustomerModal from './components/CustomerModal';
import ReceiptModal from './components/ReceiptModal';
import CashPaymentModal from './components/CashPaymentModal';
import ShiftModal from './components/ShiftModal';
import PaymentReceiptModal from './components/PaymentReceiptModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import SupplierOrderModal from './components/SupplierOrderModal';
import TelegramBotModal from './components/TelegramBotModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import CashierCalculator from './components/CashierCalculator';
import PensionCalendarModal from './components/PensionCalendarModal';
import CustomerQRCardModal from './components/CustomerQRCardModal';
import InstallmentsModal from './components/InstallmentsModal';
import {
  getStorageData,
  saveProducts,
  saveCustomers,
  saveTransactions,
  saveSuppliers,
  saveWriteOffs,
  saveSettings
} from './utils/storage';

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [writeOffs, setWriteOffs] = useState([]);
  const [settings, setSettings] = useState({});

  // Theme: 'light' | 'dark' | 'sunlight'
  const [theme, setTheme] = useState('light');

  // Shift state (Smena)
  const [currentShift, setCurrentShift] = useState({
    isOpen: true,
    openedAt: new Date().toISOString(),
    startingCash: 100000,
    cashierName: 'Umarali aka'
  });

  // User role: 'cashier' | 'admin'
  const [userRole, setUserRole] = useState('cashier');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('pos'); // pos, debt, inventory, reports, admin
  const [cart, setCart] = useState([]);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentReceiptData, setPaymentReceiptData] = useState(null);
  const [isCashPaymentModalOpen, setIsCashPaymentModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isSupplierOrderOpen, setIsSupplierOrderOpen] = useState(false);
  const [isTelegramBotOpen, setIsTelegramBotOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isPensionCalendarOpen, setIsPensionCalendarOpen] = useState(false);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);
  const [barcodeLabelProduct, setBarcodeLabelProduct] = useState(null);
  const [selectedPOSCustomer, setSelectedPOSCustomer] = useState(null);
  const [qrCardCustomer, setQrCardCustomer] = useState(null);
  const [installmentsCustomer, setInstallmentsCustomer] = useState(null);

  // PWA install prompt handler
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert("Ilovani telefonga o'rnatish uchun:\nBrauzeringizning uchta nuqta (⋮) menyusini bosing va 'Bosh ekranga qo'shish' yoki 'O'rnatish'ni tanlang!");
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'sunlight' : prev === 'sunlight' ? 'dark' : 'light'));
  };

  // Initialize data on mount
  useEffect(() => {
    const data = getStorageData();
    setProducts(data.products);
    setCustomers(data.customers);
    setTransactions(data.transactions);
    setSuppliers(data.suppliers || []);
    setWriteOffs(data.writeOffs || []);
    setSettings(data.settings);
    setDataLoaded(true);
  }, []);

  // Save whenever state changes (after initial load)
  useEffect(() => {
    if (!dataLoaded) return;
    saveProducts(products);
  }, [products, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveCustomers(customers);
  }, [customers, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveTransactions(transactions);
  }, [transactions, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveSuppliers(suppliers);
  }, [suppliers, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveWriteOffs(writeOffs);
  }, [writeOffs, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    saveSettings(settings);
  }, [settings, dataLoaded]);

  // Handler: Add to cart helper (Used by Scanner, Voice, Calculator)
  const handleAddToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
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
          quantity: quantity
        }
      ];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handler: Complete Sale from POS
  const handleCompleteSale = ({ cart: saleCart, total, paymentMethod, customer, receivedAmount, changeAmount, cashbackUsed }) => {
    const timestamp = new Date().toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Deduct stocks
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = saleCart.find((item) => item.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    let updatedCustomer = null;

    // 2. If Debt, update customer's balance & history
    if (paymentMethod === 'debt' && customer) {
      const itemsSummary = saleCart.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
      
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            const newBal = (c.balance || 0) + total;
            const newHist = [
              {
                id: `hist-${Date.now()}`,
                date: timestamp,
                type: 'debt',
                amount: total,
                items: itemsSummary,
                description: 'Nasiyaga xarid qilindi'
              },
              ...(c.history || [])
            ];
            updatedCustomer = { ...c, balance: newBal, history: newHist };
            return updatedCustomer;
          }
          return c;
        })
      );
    }

    // 3. Reward Cashback on cash/card sales if customer attached
    if (customer && (cashbackUsed > 0 || total > 0)) {
      const earnedBonus = Math.round(total * 0.01); // 1% cashback
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === customer.id) {
            const newBonus = Math.max(0, (c.cashback || 0) - (cashbackUsed || 0) + earnedBonus);
            return { ...c, cashback: newBonus };
          }
          return c;
        })
      );
    }

    // 4. Add transaction
    const newTx = {
      id: `tx-${Date.now()}`,
      date: timestamp,
      itemsCount: saleCart.reduce((sum, i) => sum + i.quantity, 0),
      total,
      paymentMethod,
      customerName:
        paymentMethod === 'debt'
          ? (updatedCustomer?.name || customer?.name || 'Nasiyador')
          : (paymentMethod === 'card' ? 'Karta orqali' : 'Naqd savdo'),
      customerId: customer?.id || null,
      itemsSummary: saleCart.map((i) => `${i.name} × ${i.quantity}`).join(', '),
      receivedAmount,
      changeAmount
    };

    setTransactions((prev) => [newTx, ...prev]);

    // 5. Open Receipt Modal
    setReceiptData({
      cart: saleCart,
      total,
      paymentMethod,
      customer: updatedCustomer || customer,
      timestamp,
      receivedAmount,
      changeAmount
    });
  };

  // Handler: Customer pays their debt in Debt Book
  const handleRecordPayment = (customerId, amount, note) => {
    const timestamp = new Date().toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    let paidCustName = '';
    let remainingBal = 0;
    const bonusEarned = Math.round(amount * 0.01); // 1% bonus on paying debt!

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          paidCustName = c.name;
          const newBal = Math.max(0, (c.balance || 0) - amount);
          remainingBal = newBal;
          const newBonus = (c.cashback || 0) + bonusEarned;
          const newRating = Math.min(5, (c.rating || 4) + 1); // Boost rating on payment!

          const newHist = [
            {
              id: `hist-${Date.now()}`,
              date: timestamp,
              type: 'payment',
              amount,
              description: note || 'Qarz toʻlandi'
            },
            ...(c.history || [])
          ];
          return { ...c, balance: newBal, cashback: newBonus, rating: newRating, history: newHist };
        }
        return c;
      })
    );

    // Record as cash transaction income
    const newTx = {
      id: `tx-${Date.now()}`,
      date: timestamp,
      itemsCount: 1,
      total: amount,
      paymentMethod: 'cash',
      customerName: `${paidCustName} (Qarz qaytarildi)`,
      customerId: customerId,
      itemsSummary: note || 'Nasiya qarzi yopildi'
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Trigger Payment Receipt Modal with Telegram share!
    setPaymentReceiptData({
      customerName: paidCustName,
      amount,
      remainingBalance: remainingBal,
      note,
      date: timestamp,
      cashbackEarned: bonusEarned
    });
  };

  // Product CRUD
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleBulkAddProducts = (newProductsList, replaceAll = false) => {
    if (replaceAll) {
      setProducts(newProductsList);
    } else {
      setProducts((prev) => [...newProductsList, ...prev]);
    }
  };

  const handleUpdateStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, (p.stock || 0) + delta) };
        }
        return p;
      })
    );
  };

  // Supplier handlers
  const handleAddSupplier = (newSupplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const handleSupplierPayment = (supplierId, amount, note) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newDebt = Math.max(0, (s.ourDebt || 0) - amount);
          const newHist = [
            { id: `sh-${Date.now()}`, date: timestamp, type: 'payment', amount, description: note },
            ...(s.history || [])
          ];
          return { ...s, ourDebt: newDebt, history: newHist };
        }
        return s;
      })
    );
  };

  const handleSupplierDelivery = (supplierId, amount, note) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newDebt = (s.ourDebt || 0) + amount;
          const newHist = [
            { id: `sh-${Date.now()}`, date: timestamp, type: 'delivery', amount, description: note },
            ...(s.history || [])
          ];
          return { ...s, ourDebt: newDebt, history: newHist };
        }
        return s;
      })
    );
  };

  // Write-off (Brak) handler
  const handleAddWriteOff = (writeOffItem, productId, qty) => {
    setWriteOffs((prev) => [writeOffItem, ...prev]);
    handleUpdateStock(productId, -qty);
  };

  // Customer handler
  const handleSaveCustomer = (newCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    if (installmentsCustomer && installmentsCustomer.id === updatedCustomer.id) {
      setInstallmentsCustomer(updatedCustomer);
    }
    if (selectedPOSCustomer && selectedPOSCustomer.id === updatedCustomer.id) {
      setSelectedPOSCustomer(updatedCustomer);
    }
  };

  const handleCustomerDetectedFromScanner = (customer) => {
    setSelectedPOSCustomer(customer);
    setActiveTab('pos');
  };

  // Voice assistant recognized action
  const handleVoiceAction = (actions) => {
    setActiveTab('pos');
    actions.forEach((action) => {
      handleAddToCart(action.product, action.quantity);
    });
  };

  // Restore backup data
  const handleRestoreData = (backup) => {
    if (backup.products) setProducts(backup.products);
    if (backup.customers) setCustomers(backup.customers);
    if (backup.transactions) setTransactions(backup.transactions);
    if (backup.suppliers) setSuppliers(backup.suppliers);
    if (backup.writeOffs) setWriteOffs(backup.writeOffs);
    if (backup.settings) setSettings(backup.settings);
  };

  // Badges calculations
  const totalDebt = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = customers.filter((c) => c.balance > 0 && c.dueDate && c.dueDate < todayStr).length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-600">Dastur yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      theme === 'sunlight'
        ? 'bg-amber-100 text-slate-950 font-bold'
        : theme === 'dark'
        ? 'bg-slate-900 text-slate-100'
        : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Header */}
      <Header
        settings={settings}
        userRole={userRole}
        currentShift={currentShift}
        onOpenShiftModal={() => setIsShiftModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenNewCustomer={() => setIsCustomerModalOpen(true)}
        onOpenSupplierOrder={() => setIsSupplierOrderOpen(true)}
        onOpenTelegramBot={() => setIsTelegramBotOpen(true)}
        onInstallPWA={handleInstallPWA}
        onOpenAdminPin={() => setIsAdminPinOpen(true)}
        onSwitchToCashier={() => {
          setUserRole('cashier');
          setActiveTab('pos');
        }}
      />

      {/* Navigation tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalDebt={totalDebt}
        overdueCount={overdueCount}
        lowStockCount={lowStockCount}
        userRole={userRole}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'pos' && (
          <POSView
            products={products}
            customers={customers}
            cart={cart}
            setCart={setCart}
            selectedCustomerId={selectedPOSCustomer?.id || ''}
            setSelectedCustomerId={(id) => setSelectedPOSCustomer(customers.find((c) => c.id === id) || null)}
            onCompleteSale={handleCompleteSale}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenCashPaymentModal={() => setIsCashPaymentModalOpen(true)}
          />
        )}

        {activeTab === 'debt' && (
          <DebtBookView
            customers={customers}
            settings={settings}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onRecordPayment={handleRecordPayment}
            onOpenPensionCalendar={() => setIsPensionCalendarOpen(true)}
            onOpenQRCard={(customer) => setQrCardCustomer(customer)}
            onOpenInstallments={(customer) => setInstallmentsCustomer(customer)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            customers={customers}
            products={products}
            settings={settings}
            onSaveSettings={setSettings}
            onRestoreData={handleRestoreData}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            products={products}
            suppliers={suppliers}
            writeOffs={writeOffs}
            settings={settings}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onBulkAddProducts={handleBulkAddProducts}
            onAddSupplier={handleAddSupplier}
            onSupplierPayment={handleSupplierPayment}
            onSupplierDelivery={handleSupplierDelivery}
            onAddWriteOff={handleAddWriteOff}
            onSaveSettings={setSettings}
            onSwitchToCashier={() => {
              setUserRole('cashier');
              setActiveTab('pos');
            }}
            onOpenBarcodeLabel={(p) => setBarcodeLabelProduct(p)}
          />
        )}
      </main>

      {/* Cash Change (Sdacha) Modal */}
      <CashPaymentModal
        isOpen={isCashPaymentModalOpen}
        onClose={() => setIsCashPaymentModalOpen(false)}
        cartTotal={cartTotal}
        onConfirmPayment={(paymentDetails) => {
          handleCompleteSale({
            cart,
            total: cartTotal,
            paymentMethod: 'cash',
            customer: null,
            receivedAmount: paymentDetails.receivedAmount,
            changeAmount: paymentDetails.changeAmount,
            cashbackUsed: paymentDetails.cashbackUsed
          });
          setCart([]);
        }}
      />

      {/* Shift Management (Smena & Z-Hisobot) Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        currentShift={currentShift}
        transactions={transactions}
        settings={settings}
        onOpenShift={(shift) => setCurrentShift(shift)}
        onCloseShift={(closedShift) => setCurrentShift(closedShift)}
      />

      {/* Debt Payment Receipt Modal with Telegram */}
      <PaymentReceiptModal
        isOpen={Boolean(paymentReceiptData)}
        onClose={() => setPaymentReceiptData(null)}
        paymentData={paymentReceiptData}
        settings={settings}
      />

      {/* Admin PIN Auth Modal */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        currentPin={settings.adminPin || '7777'}
        onSuccess={() => {
          setUserRole('admin');
          setActiveTab('admin');
        }}
      />

      {/* Barcode Sticker Label Modal */}
      <BarcodeLabelModal
        isOpen={Boolean(barcodeLabelProduct)}
        onClose={() => setBarcodeLabelProduct(null)}
        product={barcodeLabelProduct}
        settings={settings}
        onUpdateBarcode={(productId, newBarcode) => {
          handleUpdateProduct({
            ...barcodeLabelProduct,
            barcode: newBarcode
          });
        }}
      />

      {/* Modals for 8 Features */}
      
      {/* 1. Barcode & Customer QR Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        customers={customers}
        onDetected={(product) => {
          handleAddToCart(product, 1);
        }}
        onCustomerDetected={handleCustomerDetectedFromScanner}
      />

      {/* 2. Wholesale Supplier Order Modal */}
      <SupplierOrderModal
        isOpen={isSupplierOrderOpen}
        onClose={() => setIsSupplierOrderOpen(false)}
        products={products}
        settings={settings}
      />

      {/* 3. Community Telegram Bot Portal & Simulator */}
      <TelegramBotModal
        isOpen={isTelegramBotOpen}
        onClose={() => setIsTelegramBotOpen(false)}
        customers={customers}
        products={products}
        settings={settings}
      />

      {/* 4. Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        products={products}
        customers={customers}
        onVoiceAction={handleVoiceAction}
      />

      {/* 6. Cashier Numpad Calculator Modal */}
      <CashierCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onAddToCart={(customItem) => {
          setCart((prev) => [...prev, customItem]);
        }}
      />

      {/* 7 & 8. Pension & Salary Repayment Calendar Modal */}
      <PensionCalendarModal
        isOpen={isPensionCalendarOpen}
        onClose={() => setIsPensionCalendarOpen(false)}
        customers={customers}
        settings={settings}
      />

      {/* Standard Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSaveCustomer={handleSaveCustomer}
      />

      <ReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        saleData={receiptData}
        settings={settings}
      />

      {/* Customer QR Nasiya Card Modal */}
      <CustomerQRCardModal
        isOpen={Boolean(qrCardCustomer)}
        onClose={() => setQrCardCustomer(null)}
        customer={qrCardCustomer}
        settings={settings}
      />

      {/* Customer Installments (Rassrochka) Schedule Modal */}
      <InstallmentsModal
        isOpen={Boolean(installmentsCustomer)}
        onClose={() => setInstallmentsCustomer(null)}
        customer={installmentsCustomer}
        settings={settings}
        onUpdateCustomer={handleUpdateCustomer}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
}
