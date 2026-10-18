import React, { useState, useEffect, useRef } from 'react';
import {
  Store, Wifi, Truck, Bot, Smartphone, Lock, Shield, Clock, Sun, Moon,
  Zap, MessageSquare, Key, ClipboardCheck, Volume2, VolumeX, Users
} from 'lucide-react';
import { isSoundMuted, setSoundMuted, playAddToCart } from '../utils/sound';

const THEME_LABEL = { light: 'Kun rejimi', dark: 'Tun rejimi', sunlight: 'Quyosh rejimi (yuqori kontrast)' };

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [muted, setMuted] = useState(isSoundMuted());
  const menuRef = useRef(null);

  // Close the popover on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const run = (fn) => () => {
    setMenuOpen(false);
    fn && fn();
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
    if (!next) playAddToCart();
  };

  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  const menuItems = [
    { icon: Users, label: 'Yangi nasiyador', onClick: run(onOpenNewCustomer) },
    { icon: Truck, label: 'Optomchilarga buyurtma', onClick: run(onOpenSupplierOrder) },
    { icon: ClipboardCheck, label: 'Inventarizatsiya (Reviziya)', onClick: run(onOpenStockAudit) },
    { icon: Bot, label: 'Mahalla Telegram boti', onClick: run(onOpenTelegramBot) },
    { icon: MessageSquare, label: 'SMS xabarnomalar', onClick: run(onOpenSmsGateway) },
    { icon: Key, label: 'PRO litsenziya', onClick: run(onOpenLicense) },
    { icon: Smartphone, label: 'Telefonga oʻrnatish', onClick: run(onInstallPWA) }
  ];

  return (
    <header className={`${
      theme === 'sunlight'
        ? 'bg-white text-black border-b-4 border-black'
        : theme === 'dark'
        ? 'bg-slate-950 text-white border-b border-slate-800'
        : 'bg-emerald-800 text-white'
    } shadow-lg sticky top-0 z-30 transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

          {/* 1. Brand + offline indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/15 border border-white/20 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight m-0 truncate">
                {settings.shopName || 'Baraka Doʻkoni'}
              </h1>
              <p className="hidden sm:flex items-center gap-1 text-xs font-semibold opacity-80 m-0">
                <Wifi className="w-3 h-3" /> Offline tayyor
              </p>
            </div>
          </div>

          {/* 2. Shift status */}
          <button
            onClick={onOpenShiftModal}
            title="Kassa smenasini ochish/yopish (Z-Hisobot)"
            className="flex items-center gap-2 px-3 sm:px-4 h-11 text-xs sm:text-sm font-bold rounded-2xl transition bg-white/10 hover:bg-white/20 border border-white/20 shrink-0"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${currentShift?.isOpen ? 'bg-emerald-300' : 'bg-rose-400'}`} />
            <Clock className="w-4 h-4 hidden sm:block" />
            <span>{currentShift?.isOpen ? 'Smena ochiq' : 'Smena yopiq'}</span>
          </button>

          {/* 3. Quick actions menu + admin */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-1.5 px-3 sm:px-4 h-11 text-sm font-extrabold rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition active:scale-95 shadow-sm"
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Amallar</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50"
                >
                  {menuItems.map(({ icon: Icon, label, onClick }) => (
                    <button
                      key={label}
                      role="menuitem"
                      onClick={onClick}
                      className="w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 text-left"
                    >
                      <Icon className="w-5 h-5 text-slate-500 shrink-0" />
                      {label}
                    </button>
                  ))}

                  <div className="my-1.5 border-t border-slate-200" />

                  <button
                    role="menuitem"
                    onClick={() => onToggleTheme && onToggleTheme()}
                    className="w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 text-left"
                  >
                    <ThemeIcon className="w-5 h-5 text-slate-500 shrink-0" />
                    <span className="flex-1">{THEME_LABEL[theme]}</span>
                    <span className="text-[11px] font-semibold text-slate-400">almashtirish</span>
                  </button>
                  <button
                    role="menuitem"
                    onClick={toggleSound}
                    className="w-full flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 active:bg-slate-200 text-left"
                  >
                    {muted ? (
                      <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                    <span className="flex-1">Doʻkon ohanglari</span>
                    <span className="text-[11px] font-semibold text-slate-400">{muted ? 'oʻchiq' : 'yoniq'}</span>
                  </button>
                </div>
              )}
            </div>

            {userRole === 'admin' ? (
              <button
                onClick={onSwitchToCashier}
                title="Sotuvchi rejimiga oʻtish"
                className="flex items-center gap-1.5 px-3 h-11 text-sm font-black text-amber-300 bg-slate-950 hover:bg-slate-900 rounded-2xl transition border border-amber-400/40"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Chiqish</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminPin}
                title="Doʻkon egasi admin paneliga kirish"
                aria-label="Admin"
                className="flex items-center justify-center gap-1.5 w-11 sm:w-auto sm:px-3 h-11 text-sm font-black bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
