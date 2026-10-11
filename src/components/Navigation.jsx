import React from 'react';
import { ShoppingCart, BookOpen, Package, BarChart3, AlertCircle, Shield } from 'lucide-react';
import { formatMoney } from '../utils/storage';

export default function Navigation({
  activeTab,
  setActiveTab,
  totalDebt,
  overdueCount,
  lowStockCount,
  userRole = 'cashier'
}) {
  const tabs = [
    {
      id: 'pos',
      label: 'Kassa (Sotuv)',
      icon: ShoppingCart,
      badge: null
    },
    {
      id: 'debt',
      label: 'Nasiya daftari',
      icon: BookOpen,
      badge: totalDebt > 0 ? formatMoney(totalDebt) : null,
      urgent: overdueCount > 0 ? `${overdueCount} muddati o'tgan` : null
    },
    {
      id: 'inventory',
      label: 'Ombor & Tovarlar',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} kam qolgan` : null,
      isWarning: lowStockCount > 0
    },
    {
      id: 'reports',
      label: 'Hisobot & Kassa',
      icon: BarChart3,
      badge: null
    }
  ];

  // If in admin mode, add Admin Panel tab
  if (userRole === 'admin') {
    tabs.push({
      id: 'admin',
      label: '🛡️ Admin Paneli',
      icon: Shield,
      badge: 'Egasi',
      isAdminTab: true
    });
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-base whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? tab.isAdminTab
                      ? 'bg-slate-900 text-amber-300 shadow-md scale-[1.02]'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                    : tab.isAdminTab
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? (tab.isAdminTab ? 'text-amber-300' : 'text-white') : (tab.isAdminTab ? 'text-amber-600' : 'text-slate-500')}`} />
                <span>{tab.label}</span>

                {/* Badge for Debt or Stock */}
                {tab.urgent && !isActive && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-extrabold bg-rose-500 text-white rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    <AlertCircle className="w-3 h-3" /> {tab.urgent}
                  </span>
                )}
                {tab.badge && !tab.urgent && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? 'bg-emerald-700 text-emerald-100'
                        : tab.isAdminTab
                        ? 'bg-amber-200 text-amber-900 font-black'
                        : tab.isWarning
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
