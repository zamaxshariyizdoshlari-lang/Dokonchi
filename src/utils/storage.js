import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS } from '../data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'baraka_pos_products_v1',
  CUSTOMERS: 'baraka_pos_customers_v1',
  TRANSACTIONS: 'baraka_pos_transactions_v1',
  SETTINGS: 'baraka_pos_settings_v1',
  SUPPLIERS: 'baraka_pos_suppliers_v1',
  WRITEOFFS: 'baraka_pos_writeoffs_v1'
};

export const INITIAL_SUPPLIERS = [
  {
    id: 'supp-1',
    name: 'Baxtiyor aka (Unchi)',
    company: 'Oltin Boshoq MCHJ',
    phone: '+998 90 555 44 33',
    products: 'Oliy va 1-navli un qoplari',
    ourDebt: 2300000, // Bizning qarzimiz
    dueDate: '2026-10-20',
    history: [
      { id: 'sh-1', date: '2026-10-05', type: 'delivery', amount: 4600000, description: '20 qop un keltirildi' },
      { id: 'sh-2', date: '2026-10-06', type: 'payment', amount: 2300000, description: 'Bank orqali qisman toʻlandi' }
    ]
  },
  {
    id: 'supp-2',
    name: 'Olim aka (Yogʻ Optom)',
    company: 'Baraka Yogʻ Savdo',
    phone: '+998 93 111 22 33',
    products: 'Paxta va pista yogʻlari',
    ourDebt: 820000,
    dueDate: '2026-10-25',
    history: [
      { id: 'sh-3', date: '2026-10-08', type: 'delivery', amount: 820000, description: '10 dona 5L paxta yogʻi olindi' }
    ]
  },
  {
    id: 'supp-3',
    name: 'Sarvar (Kola Distribyutor)',
    company: 'Coca-Cola Ichimliklari',
    phone: '+998 97 444 88 99',
    products: 'Coca-Cola, Fanta, Sprite',
    ourDebt: 450000,
    dueDate: '2026-10-18',
    history: [
      { id: 'sh-4', date: '2026-10-04', type: 'delivery', amount: 450000, description: '5 blok 1.5L kola keltirildi' }
    ]
  }
];

export const INITIAL_WRITEOFFS = [
  {
    id: 'wo-1',
    date: '2026-10-08 11:30',
    productName: 'Tuxum (10 dona)',
    quantity: 10,
    unit: 'dona',
    costLoss: 13000,
    reason: 'Tushib ketib singan'
  },
  {
    id: 'wo-2',
    date: '2026-10-09 16:45',
    productName: 'Qaymoq (1 banka)',
    quantity: 1,
    unit: 'dona',
    costLoss: 12000,
    reason: 'Yaroqlilik muddati oʻtgan'
  }
];

export const getStorageData = () => {
  try {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)) || INITIAL_PRODUCTS;
    const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || INITIAL_CUSTOMERS;
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || INITIAL_TRANSACTIONS;
    const suppliers = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) || INITIAL_SUPPLIERS;
    const writeOffs = JSON.parse(localStorage.getItem(STORAGE_KEYS.WRITEOFFS)) || INITIAL_WRITEOFFS;
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {
      shopName: 'Baraka Baqqollik Doʻkoni',
      ownerName: 'Umarali aka',
      phone: '+998 90 999 88 77',
      address: 'Oltintepa qishlogʻi, Markaziy koʻcha 15',
      adminPin: '7777' // Default Admin PIN
    };

    return { products, customers, transactions, settings, suppliers, writeOffs };
  } catch (error) {
    console.error('Storage reading error:', error);
    return {
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      transactions: INITIAL_TRANSACTIONS,
      suppliers: INITIAL_SUPPLIERS,
      writeOffs: INITIAL_WRITEOFFS,
      settings: {
        shopName: 'Baraka Baqqollik Doʻkoni',
        ownerName: 'Umarali aka',
        phone: '+998 90 999 88 77',
        address: 'Oltintepa qishlogʻi',
        adminPin: '7777'
      }
    };
  }
};

export const saveProducts = (products) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const saveCustomers = (customers) => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const saveTransactions = (transactions) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const saveSuppliers = (suppliers) => {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
};

export const saveWriteOffs = (writeOffs) => {
  localStorage.setItem(STORAGE_KEYS.WRITEOFFS, JSON.stringify(writeOffs));
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const formatMoney = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0';
  return Number(amount).toLocaleString('uz-UZ') + " so'm";
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

// Generate Telegram Debt Reminder text
export const generateDebtReminderText = (customer, shopSettings) => {
  const shopName = shopSettings?.shopName || 'Doʻkon';
  const phone = shopSettings?.phone || '';
  return `Assalomu alaykum, hurmatli ${customer.name}!\n\n${shopName}dan hisob-kitob bo'yicha ma'lumot:\n📌 Sizning umumiy qarz balansingiz: ${formatMoney(customer.balance)}\n${customer.dueDate ? `📅 Kelishilgan to'lov muddati: ${customer.dueDate}\n` : ''}\nIltimos, imkon qadar vaqtida hisob-kitob qilishni so'raymiz. Barakangizni bersin!\n\nBog'lanish uchun: ${phone}`;
};

// Generate Shareable WhatsApp or Telegram link
export const getTelegramShareUrl = (text) => {
  return `https://t.me/share/url?url=${encodeURIComponent(text)}`;
};

// Export all data as JSON file backup
export const exportDataBackup = () => {
  const data = getStorageData();
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const now = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `baraka_dokon_zaxira_${now}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Export Products to CSV (Excel compatible)
export const exportProductsToCSV = (products) => {
  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // BOM for Excel UTF-8
  csvContent += 'Nomi,Toifasi,Tannarxi,Sotish narxi,Birligi,Qoldiq,Min Qoldiq,Shtrix-kod\r\n';

  products.forEach((p) => {
    const row = [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.category || 'Oziq-ovqat'}"`,
      p.costPrice || 0,
      p.price || 0,
      p.unit || 'dona',
      p.stock || 0,
      p.minStock || 5,
      `"${p.barcode || ''}"`
    ].join(',');
    csvContent += row + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `tovarlar_royxati_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
