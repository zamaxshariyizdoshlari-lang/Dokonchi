export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Oliy navli Un (50 kg qop)',
    category: 'Oziq-ovqat',
    costPrice: 230000,
    price: 255000,
    unit: 'qop',
    stock: 8,
    minStock: 5,
    quickAdd: true,
    barcode: '478001234567',
    image: '🌾'
  },
  {
    id: 'prod-2',
    name: "Paxta yog'i (5 litr)",
    category: 'Oziq-ovqat',
    costPrice: 72000,
    price: 82000,
    unit: 'dona',
    stock: 14,
    minStock: 6,
    quickAdd: true,
    barcode: '478002345678',
    image: '🫗'
  },
  {
    id: 'prod-3',
    name: "Pista yog'i (1L)",
    category: 'Oziq-ovqat',
    costPrice: 18000,
    price: 22000,
    unit: 'dona',
    stock: 25,
    minStock: 10,
    quickAdd: true,
    barcode: '478003456789',
    image: '🌻'
  },
  {
    id: 'prod-4',
    name: 'Shakar (1 kg)',
    category: 'Oziq-ovqat',
    costPrice: 10500,
    price: 12000,
    unit: 'kg',
    stock: 45,
    minStock: 15,
    quickAdd: true,
    barcode: '478004567890',
    image: '🧊'
  },
  {
    id: 'prod-5',
    name: 'Tandir non',
    category: 'Non mahsulotlari',
    costPrice: 3500,
    price: 4500,
    unit: 'dona',
    stock: 30,
    minStock: 10,
    quickAdd: true,
    barcode: 'NON01',
    image: '🥖'
  },
  {
    id: 'prod-6',
    name: 'Tuxum (1 dona)',
    category: 'Oziq-ovqat',
    costPrice: 1300,
    price: 1600,
    unit: 'dona',
    stock: 90,
    minStock: 30,
    quickAdd: true,
    barcode: 'TUX01',
    image: '🥚'
  },
  {
    id: 'prod-7',
    name: "Ko'k choy 95 (Pachka)",
    category: 'Choy va qahva',
    costPrice: 12000,
    price: 15000,
    unit: 'pachka',
    stock: 18,
    minStock: 8,
    quickAdd: true,
    barcode: '478005678901',
    image: '🍵'
  },
  {
    id: 'prod-8',
    name: 'Makaron (1 kg)',
    category: 'Oziq-ovqat',
    costPrice: 8000,
    price: 10000,
    unit: 'kg',
    stock: 28,
    minStock: 10,
    quickAdd: true,
    barcode: '478006789012',
    image: '🍝'
  },
  {
    id: 'prod-9',
    name: 'Kir yuvish kukuni (450g)',
    category: 'Xoʻjalik mollari',
    costPrice: 14000,
    price: 18000,
    unit: 'dona',
    stock: 12,
    minStock: 5,
    quickAdd: false,
    barcode: '478007890123',
    image: '🧼'
  },
  {
    id: 'prod-10',
    name: 'Osh tuzi (1 kg)',
    category: 'Oziq-ovqat',
    costPrice: 1500,
    price: 2500,
    unit: 'dona',
    stock: 4,
    minStock: 10,
    quickAdd: true,
    barcode: '478008901234',
    image: '🧂'
  },
  {
    id: 'prod-11',
    name: 'Coca-Cola 1.5L',
    category: 'Ichimliklar',
    costPrice: 11500,
    price: 14000,
    unit: 'dona',
    stock: 3,
    minStock: 8,
    quickAdd: true,
    barcode: '5449000000996',
    image: '🥤'
  },
  {
    id: 'prod-12',
    name: 'Bolalar sovuni (Dona)',
    category: 'Xoʻjalik mollari',
    costPrice: 5000,
    price: 7000,
    unit: 'dona',
    stock: 15,
    minStock: 5,
    quickAdd: false,
    barcode: '478009012345',
    image: '🫧'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Rustam aka (Traktorchi)',
    phone: '+998 90 123 45 67',
    address: "Yangiobod ko'chasi 14",
    balance: 420000,
    creditLimit: 600000,
    dueDate: '2026-10-25',
    category: 'salary',
    rating: 5, // 5 stars
    cashback: 14500, // 14 500 so'm bonus
    note: "Oylik tushganda yoki g'alladan keyin yopadi",
    history: [
      {
        id: 'hist-1',
        date: '2026-10-06 17:30',
        type: 'debt',
        amount: 337000,
        items: 'Un (50 kg) - 1 dona, Yog (5L) - 1 dona',
        description: 'Nasiyaga xarid qilindi'
      },
      {
        id: 'hist-2',
        date: '2026-10-08 19:15',
        type: 'debt',
        amount: 83000,
        items: 'Shakar 3kg, Choy 95, Non 5 dona',
        description: 'Nasiyaga xarid qilindi'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Dilorom opa (Bogʻcha)',
    phone: '+998 93 456 78 90',
    address: "Maktab ko'chasi 7",
    balance: 185000,
    creditLimit: 300000,
    dueDate: '2026-10-18',
    category: 'pension',
    rating: 5,
    cashback: 8200,
    note: 'Pensiya/Oylik kuni qaytaradi',
    history: [
      {
        id: 'hist-3',
        date: '2026-10-05 11:20',
        type: 'debt',
        amount: 185000,
        items: 'Tuxum 30 dona, Shakar 5kg, Makaron 4kg',
        description: 'Nasiyaga xarid qilindi'
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Akmal usta',
    phone: '+998 97 789 12 34',
    address: "Bo'ston mahallasi 28",
    balance: 750000,
    creditLimit: 800000,
    dueDate: '2026-10-02',
    category: 'irregular',
    rating: 3, // 3 stars (muddati kechikkan)
    cashback: 4000,
    note: 'Qurilishdan pul tushsa beradi',
    history: [
      {
        id: 'hist-4',
        date: '2026-09-20 18:40',
        type: 'debt',
        amount: 950000,
        items: 'Un 2 qop, Yog 2 dona',
        description: 'Nasiyaga xarid qilindi'
      },
      {
        id: 'hist-5',
        date: '2026-10-01 16:10',
        type: 'payment',
        amount: 200000,
        description: 'Qarz qisman toʻlandi (Naqd)'
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'Sobir aka (Chorvador)',
    phone: '+998 91 321 65 43',
    address: "Qir ko'chasi 3",
    balance: 110000,
    creditLimit: 400000,
    dueDate: '2026-10-28',
    category: 'pension',
    rating: 4,
    cashback: 6500,
    note: 'Sut sotgandan soʻng beradi',
    history: [
      {
        id: 'hist-6',
        date: '2026-10-09 08:30',
        type: 'debt',
        amount: 110000,
        items: "Paxta yog'i 5L, Tuz 4 dona",
        description: 'Nasiyaga xarid qilindi'
      }
    ]
  },
  {
    id: 'cust-5',
    name: 'Gulbahor yanga',
    phone: '+998 94 654 98 70',
    address: 'Yangihayot 15',
    balance: 0,
    creditLimit: 500000,
    dueDate: '',
    category: 'salary',
    rating: 5,
    cashback: 12000,
    note: 'Har doim oʻz vaqtida toʻlaydi',
    history: [
      {
        id: 'hist-7',
        date: '2026-10-04 14:00',
        type: 'debt',
        amount: 95000,
        items: 'Shakar 5kg, Non 4 dona',
        description: 'Nasiyaga xarid qilindi'
      },
      {
        id: 'hist-8',
        date: '2026-10-09 17:00',
        type: 'payment',
        amount: 95000,
        description: 'Qarz toʻliq yopildi (Karta orqali)'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    date: '2026-10-10 08:15',
    itemsCount: 3,
    total: 35000,
    paymentMethod: 'cash', // cash, card, debt
    customerName: 'Naqd savdo',
    itemsSummary: 'Non 4 ta, Choy 95 1 ta'
  },
  {
    id: 'tx-102',
    date: '2026-10-10 11:40',
    itemsCount: 2,
    total: 104000,
    paymentMethod: 'card',
    customerName: 'Karta (Humo)',
    itemsSummary: "Paxta yog'i 1 ta, Shakar 2kg"
  },
  {
    id: 'tx-103',
    date: '2026-10-10 14:20',
    itemsCount: 1,
    total: 255000,
    paymentMethod: 'debt',
    customerName: 'Rustam aka (Traktorchi)',
    customerId: 'cust-1',
    itemsSummary: 'Un 50kg 1 qop'
  }
];
