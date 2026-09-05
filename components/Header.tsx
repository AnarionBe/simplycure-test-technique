"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Bell, Search, Stethoscope, UserRound } from "lucide-react";
import { useRecommendations } from "@/lib/recommendations";
import { isAutoRefillAlert } from "@/lib/refill";
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

interface NotificationItem {
  id: string;
  recommendationId: string;
  text: string;
  date: string;
  read: boolean;
}

/* ── Cloche de notifications (messages praticien + alertes refill auto) ─── */
function NotificationsBell() {
  const { recommendations, messages, unreadCount, markAllRead } =
    useRecommendations();
  const [open, setOpen] = useState(false);

  const systemAlerts: NotificationItem[] = recommendations
    .filter(isAutoRefillAlert)
    .map((rec) => ({
      id: `alert-${rec.id}`,
      recommendationId: rec.id,
      text:
        rec.refill?.alertLabel ??
        `${rec.products[0]?.name ?? "Votre traitement"} arrive à épuisement.`,
      date: rec.date,
      read: false,
    }));

  const items: NotificationItem[] = [
    ...messages.map((m) => ({
      id: m.id,
      recommendationId: m.recommendationId,
      text: m.text,
      date: m.date,
      read: m.read,
    })),
    ...systemAlerts,
  ];

  const total = unreadCount + systemAlerts.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex"
        aria-label="Notifications"
      >
        <span className="relative">
          <Bell className="h-[18px] w-[18px]" />
          {total > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {total}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 top-16 z-20"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-40 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <p className="text-sm font-semibold text-slate-900">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-forest-700 hover:text-forest-900"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    Aucune notification pour le moment.
                  </p>
                ) : (
                  items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/recommandations/${item.recommendationId}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-2.5 border-b border-slate-50 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          item.read ? "bg-slate-200" : "bg-amber-500"
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug text-slate-700">
                          {item.text}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {item.date}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({
  cartCount,
  activeTab,
  onTabChange,
}: HeaderProps) {
  const pathname = usePathname();
  const inPraticienSpace = pathname?.startsWith("/praticien") ?? false;

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

        {/* Onglets (masqués côté espace praticien) */}
        {!inPraticienSpace && (
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
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Bascule démo patient / praticien */}
          <Link
            href={inPraticienSpace ? "/" : "/praticien"}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700"
          >
            {inPraticienSpace ? (
              <>
                <UserRound className="h-3.5 w-3.5" />
                Vue patient
              </>
            ) : (
              <>
                <Stethoscope className="h-3.5 w-3.5" />
                Espace praticien (démo)
              </>
            )}
          </Link>

          {!inPraticienSpace && (
            <>
              <button
                className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:flex"
                aria-label="Rechercher"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <NotificationsBell />

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
            </>
          )}

          {/* Avatar */}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-white ring-2 ring-white">
            MD
          </span>
        </div>
      </div>
    </header>
  );
}
