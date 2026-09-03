"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Bell, Search } from "lucide-react";
import type { NavTab } from "@/types/recommendation";

const TABS: { id: NavTab; label: string }[] = [
  { id: "catalogue", label: "Catalogue" },
  { id: "commandes", label: "Commandes" },
  { id: "recommandations", label: "Recommandations" },
];

interface HeaderProps {
  cartCount: number;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function Header({
  cartCount,
  activeTab,
  onTabChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-900 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2c1.5 4 5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 3.5-5 5-9Z"
              />
              <path
                fill="currentColor"
                opacity="0.55"
                d="M12 13c-1 2.6-3.4 3.6-3.4 6A3.4 3.4 0 0 0 12 22a3.4 3.4 0 0 0 3.4-3c0-2.4-2.4-3.4-3.4-6Z"
              />
            </svg>
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-forest-900">
            Simplycure
          </span>
        </div>

        {/* Onglets */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-forest-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-[9px] h-0.5 rounded-full bg-forest-900"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex"
            aria-label="Rechercher"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>

          {/* Panier avec badge dynamique */}
          <button className="relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50">
            <span className="relative">
              <ShoppingCart className="h-[18px] w-[18px]" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <span className="hidden sm:inline">
              Mon panier{cartCount > 0 ? ` (${cartCount})` : ""}
            </span>
          </button>

          {/* Avatar patient */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-white ring-2 ring-white">
            MD
          </span>
        </div>
      </div>
    </header>
  );
}
