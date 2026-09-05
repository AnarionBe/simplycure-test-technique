"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Sparkles, PackageOpen } from "lucide-react";
import Header from "@/components/Header";
import RecommendationCard from "@/components/RecommendationCard";
import CompletedRecommendationRow from "@/components/CompletedRecommendationRow";
import { useCart } from "@/lib/cart";
import { getPatientView } from "@/lib/refill";
import { useRecommendations } from "@/lib/recommendations";
import type { NavTab, RecommendationFilter } from "@/types/recommendation";

const FILTERS: { id: RecommendationFilter; label: string }[] = [
  { id: "ALL", label: "Toutes" },
  { id: "NEW", label: "Nouvelles" },
  { id: "IN_PROGRESS", label: "Cures en cours" },
  { id: "REFILL_DUE", label: "À renouveler" },
  { id: "COMPLETED", label: "Terminées" },
];

export default function Home() {
  const { cartCount, isAdded, reset } = useCart();
  const { recommendations: ALL_RECS } = useRecommendations();
  const [activeTab, setActiveTab] = useState<NavTab>("recommandations");
  const [filter, setFilter] = useState<RecommendationFilter>("ALL");

  // Statuts vus par le patient (un REFILL_DUE en mode manuel reste affiché IN_PROGRESS)
  const patientStatuses = useMemo(
    () => ALL_RECS.map((r) => getPatientView(r).status),
    [ALL_RECS],
  );

  const counts = useMemo(
    () => ({
      ALL: ALL_RECS.length,
      NEW: patientStatuses.filter((s) => s === "NEW").length,
      IN_PROGRESS: patientStatuses.filter((s) => s === "IN_PROGRESS").length,
      REFILL_DUE: patientStatuses.filter((s) => s === "REFILL_DUE").length,
      COMPLETED: patientStatuses.filter((s) => s === "COMPLETED").length,
    }),
    [ALL_RECS, patientStatuses],
  );

  const visibleRecs = useMemo(
    () =>
      filter === "ALL"
        ? ALL_RECS
        : ALL_RECS.filter((r, i) => patientStatuses[i] === filter),
    [filter, ALL_RECS, patientStatuses],
  );

  // Les cures terminées n'ont plus besoin d'une carte complète : elles sont
  // regroupées à part, en liste compacte.
  const { activeRecs, completedRecs } = useMemo(() => {
    const active: typeof visibleRecs = [];
    const completed: typeof visibleRecs = [];
    for (const rec of visibleRecs) {
      (getPatientView(rec).status === "COMPLETED" ? completed : active).push(
        rec,
      );
    }
    return { activeRecs: active, completedRecs: completed };
  }, [visibleRecs]);

  const resetDemo = useCallback(() => {
    reset();
    setFilter("ALL");
  }, [reset]);

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

            {/* Section "En cours" : display actuel, inchangé */}
            {activeRecs.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  En cours ({activeRecs.length})
                </h2>
                <motion.div
                  layout
                  className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3"
                >
                  <AnimatePresence mode="popLayout">
                    {activeRecs.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        cartState={isAdded(rec.id) ? "added" : "idle"}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {/* Section "Terminées" : liste de cards inline compactes */}
            {completedRecs.length > 0 && (
              <div className={activeRecs.length > 0 ? "mt-8" : "mt-6"}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Terminées ({completedRecs.length})
                </h2>
                <motion.div layout className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {completedRecs.map((rec) => (
                      <CompletedRecommendationRow
                        key={rec.id}
                        recommendation={rec}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
