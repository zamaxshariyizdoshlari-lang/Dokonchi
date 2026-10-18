import React from 'react';
import {
  Store, Download, Plus, Wifi, Truck, Bot, Smartphone, Lock, Shield,
  Clock, Sun, Moon, Sparkles, MessageSquare, Key, ClipboardCheck
} from 'lucide-react';
import { exportDataBackup } from '../utils/storage';

export default function Header({
  settings,
  userRole, // 'cashier' | 'admin'
  currentShift,
  onOpenShiftModal,
  theme = 'light',
  onToggleTheme,
  onOpenNewCustomer,
  onOpenSupplierOrder,
  onOpenTelegramBot,
  onOpenSmsGateway,
  onOpenStockAudit,
  onOpenLicense,
  onInstallPWA,
  onOpenAdminPin,
  onSwitchToCashier
}) {
  return (
    <header className={`${
      theme === 'sunlight'
        ? 'bg-amber-400 text-slate-950 border-b-4 border-slate-950'
        : theme === 'dark'
        ? 'bg-slate-950 text-white border-b border-slate-800'
        : 'bg-emerald-700 text-white'
    } shadow-lg sticky top-0 z-30 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Store Info */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 ${
              theme === 'sunlight' ? 'bg-slate-950 text-amber-400 border-slate-900' : 'bg-white/15 text-emerald-100 border-white/20'
            }`}>
              <Store className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className={`text-base sm:text-2xl font-black tracking-tight m-0 truncate ${
                  theme === 'sunlight' ? 'text-slate-950' : 'text-white'
                }`}>
                  {settings.shopName || 'Baraka Doʻkoni'}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 bg-black/10 text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0">
                  <Wifi className="w-3 h-3" /> Offline tayyor
                </span>
              </div>
              <p className={`text-xs font-medium hidden sm:block truncate opacity-85`}>
                {settings.address || 'Qishloq markazi'} • Egasi: {settings.ownerName}
              </p>
            </div>
          </div>

          {/* Quick Actions Header Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Shift (Smena & Z-Hisobot) */}
            <button
              onClick={onOpenShiftModal}
              title="Kassa smenasini ochish/yopish (Z-Hisobot)"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition shadow-xs ${
                currentShift?.isOpen
                  ? 'bg-emerald-500/30 text-white border border-emerald-300/40 hover:bg-emerald-500/50'
                  : 'bg-rose-500/30 text-white border border-rose-300/40 hover:bg-rose-500/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${currentShift?.isOpen ? 'bg-emerald-300 animate-ping' : 'bg-rose-400'}`} />
              <Clock className="w-4 h-4" />
              <span className="hidden lg:inline">{currentShift?.isOpen ? 'Smena ochiq' : 'Smena yopiq'}</span>
            </button>

            {/* Theme switcher: Light / Dark / Sunlight */}
            <button
              onClick={onToggleTheme}
              title="Rejimni almashtirish (Quyosh / Tun / Kun)"
              className="p-2 sm:px-2.5 sm:py-2 text-xs font-bold rounded-xl bg-black/15 hover:bg-black/25 transition border border-white/20 flex items-center gap-1"
            >
              {theme === 'sunlight' ? (
                <>
                  <Sun className="w-4 h-4 text-slate-950" />
                  <span className="hidden xl:inline text-slate-950 font-black">Quyosh</span>
                </>
              ) : theme === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-amber-300" />
                  <span className="hidden xl:inline text-slate-200">Tun</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-200" />
                  <span className="hidden xl:inline text-white">Kun</span>
                </>
              )}
            </button>

            {/* Wholesale Supplier Order */}
            <button
              onClick={onOpenSupplierOrder}
              title="Optomchilarga buyurtma"
              className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition bg-black/15 hover:bg-black/25 border border-white/20"
            >
              <Truck className="w-4 h-4 text-amber-300" />
              <span className="hidden lg:inline">Optomchilarga</span>
            </button>

            {/* Village Telegram Bot */}
            <button
              onClick={onOpenTelegramBot}
              title="Mahalla Telegram Boti"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition bg-sky-600/90 hover:bg-sky-600 border border-sky-400/40 text-white"
            >
              <Bot className="w-4 h-4 text-sky-100" />
              <span className="hidden md:inline">Mahalla Boti</span>
            </button>

            {/* SMS Gateway */}
            <button
              onClick={onOpenSmsGateway}
              title="SMS Xabarnomalar (Eskiz.uz)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition bg-black/15 hover:bg-black/25 border border-white/20"
            >
              <MessageSquare className="w-4 h-4 text-sky-300" />
              <span className="hidden xl:inline">SMS</span>
            </button>

            {/* Inventory Audit */}
            <button
              onClick={onOpenStockAudit}
              title="Inventarizatsiya va Reviziya (Ombor sanog'i)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition bg-black/15 hover:bg-black/25 border border-white/20"
            >
              <ClipboardCheck className="w-4 h-4 text-amber-300" />
              <span className="hidden xl:inline">Reviziya</span>
            </button>

            {/* License status */}
            <button
              onClick={onOpenLicense}
              title="Do'kon litsenziyasi va aktivatsiya holati"
              className="hidden xl:flex items-center gap-1 px-2.5 py-2 text-xs font-black rounded-xl transition bg-emerald-500/25 hover:bg-emerald-500/40 border border-emerald-300/40 text-emerald-200"
            >
              <Key className="w-3.5 h-3.5 text-emerald-300" />
              <span>PRO</span>
            </button>

            {/* PWA Install */}
            <button
              onClick={onInstallPWA}
              title="Telefonga o'rnatish"
              className="hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl transition bg-black/15 hover:bg-black/25 border border-white/20"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            {/* Add Debtee */}
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nasiyador</span>
            </button>

            {/* Admin Mode Toggle */}
            {userRole === 'admin' ? (
              <button
                onClick={onSwitchToCashier}
                title="Sotuvchi rejimiga o'tish"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-black text-amber-300 bg-slate-950 hover:bg-slate-900 rounded-xl transition border border-amber-400/40 shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Admin (Chiqish)</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminPin}
                title="Do'kon egasi admin paneliga kirish (PIN: 7777)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-md active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Admin</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
