"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles, PackageOpen } from "lucide-react";
import Header from "@/components/Header";
import RecommendationCard from "@/components/RecommendationCard";
import DetailModal from "@/components/DetailModal";
import Toast, { type ToastData } from "@/components/Toast";
import { recommendations as ALL_RECS } from "@/data/mockData";
import { withDiscount } from "@/lib/format";
import type {
  CartLine,
  NavTab,
  Recommendation,
  RecommendationFilter,
} from "@/types/recommendation";

const FILTERS: { id: RecommendationFilter; label: string }[] = [
  { id: "ALL", label: "Toutes" },
  { id: "NEW", label: "Nouvelles" },
  { id: "IN_PROGRESS", label: "Cures en cours" },
  { id: "REFILL_DUE", label: "À renouveler" },
  { id: "COMPLETED", label: "Terminées" },
];

/** "Dr. Marco De Bona" -> "Dr. De Bona" */
function shortDoctor(fullName: string): string {
  return `Dr. ${fullName.split(" ").slice(-2).join(" ")}`;
}

export default function Home() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [addedRecIds, setAddedRecIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<NavTab>("recommandations");
  const [filter, setFilter] = useState<RecommendationFilter>("ALL");
  const [detailRec, setDetailRec] = useState<Recommendation | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const cartCount = useMemo(
    () => cart.reduce((n, line) => n + line.quantity, 0),
    [cart],
  );

  const counts = useMemo(
    () => ({
      ALL: ALL_RECS.length,
      NEW: ALL_RECS.filter((r) => r.status === "NEW").length,
      IN_PROGRESS: ALL_RECS.filter((r) => r.status === "IN_PROGRESS").length,
      REFILL_DUE: ALL_RECS.filter((r) => r.status === "REFILL_DUE").length,
      COMPLETED: ALL_RECS.filter((r) => r.status === "COMPLETED").length,
    }),
    [],
  );

  const visibleRecs = useMemo(
    () =>
      filter === "ALL"
        ? ALL_RECS
        : ALL_RECS.filter((r) => r.status === filter),
    [filter],
  );

  const addRecToCart = useCallback(
    (rec: Recommendation, message: string) => {
      setCart((prev) => {
        const lines: CartLine[] = rec.products.map((p) => ({
          productId: p.id,
          name: p.name,
          unitPrice: withDiscount(p.price, rec.practitioner.discountRate),
          quantity: 1,
          recommendationId: rec.id,
          practitionerName: rec.practitioner.name,
        }));
        return [...prev, ...lines];
      });
      setAddedRecIds((prev) => new Set(prev).add(rec.id));
      setToast({ id: Date.now(), message });
    },
    [],
  );

  const handleRefill = useCallback(
    (rec: Recommendation) => {
      const productName = rec.products[0]?.name ?? "Produit";
      addRecToCart(
        rec,
        `${productName} ajouté à votre panier avec l'avantage du ${shortDoctor(
          rec.practitioner.name,
        )} !`,
      );
      setDetailRec(null);
    },
    [addRecToCart],
  );

  const handleAddToCart = useCallback(
    (rec: Recommendation) => {
      const doctor = shortDoctor(rec.practitioner.name);
      const message =
        rec.status === "COMPLETED"
          ? `Cure « ${rec.products[0]?.name} » relancée et ajoutée à votre panier avec l'avantage du ${doctor} !`
          : `Recommandation du ${doctor} ajoutée à votre panier (${rec.products.length} produit${
              rec.products.length > 1 ? "s" : ""
            }, ${rec.practitioner.discountLabel} appliqué)`;
      addRecToCart(rec, message);
      setDetailRec(null);
    },
    [addRecToCart],
  );

  const resetDemo = useCallback(() => {
    setCart([]);
    setAddedRecIds(new Set());
    setToast(null);
    setDetailRec(null);
    setFilter("ALL");
  }, []);

  return (
    <>
      <Header
        cartCount={cartCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        {activeTab !== "recommandations" ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
            <PackageOpen className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              {activeTab === "catalogue" ? "Catalogue" : "Commandes"} — hors
              périmètre de ce prototype
            </p>
            <button
              onClick={() => setActiveTab("recommandations")}
              className="mt-4 rounded-lg bg-forest-900 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
            >
              Revenir au cockpit
            </button>
          </div>
        ) : (
          <>
            {/* Contexte case study */}
            <div className="flex items-start gap-2.5 rounded-xl border border-forest-900/10 bg-forest-50 px-4 py-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              <p className="text-sm text-forest-900">
                <span className="font-semibold">Case study —</span> l&apos;onglet
                Recommandations n&apos;est plus une table d&apos;historique
                passive : c&apos;est un cockpit qui déclenche le réachat au
                moment exact où la boîte arrive à épuisement.
              </p>
            </div>

            {/* Titre */}
            <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Cockpit de suivi de cure
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Vos recommandations prescrites par le Dr. Marco De Bona ·
                  Septembre 2026
                </p>
              </div>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={resetDemo}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Réinitialiser la démo
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Filtres */}
            <div className="mt-5 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = f.id === filter;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-forest-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`rounded-full px-1.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {counts[f.id]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grille de cartes */}
            <motion.div
              layout
              className="mt-6 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {visibleRecs.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    cartState={addedRecIds.has(rec.id) ? "added" : "idle"}
                    onOpenDetail={setDetailRec}
                    onRefill={handleRefill}
                    onViewCart={() => setToast({
                      id: Date.now(),
                      message: `Votre panier contient ${cartCount} article${cartCount > 1 ? "s" : ""}.`,
                    })}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>

      <DetailModal
        recommendation={detailRec}
        cartState={
          detailRec && addedRecIds.has(detailRec.id) ? "added" : "idle"
        }
        onClose={() => setDetailRec(null)}
        onAddToCart={handleAddToCart}
        onRefill={handleRefill}
        onViewCart={() =>
          setToast({
            id: Date.now(),
            message: `Votre panier contient ${cartCount} article${
              cartCount > 1 ? "s" : ""
            }.`,
          })
        }
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
