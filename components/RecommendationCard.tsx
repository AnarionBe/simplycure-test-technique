"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Pill,
  Clock,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import type { CartState, Recommendation } from "@/types/recommendation";
import { formatEuro } from "@/lib/format";

interface RecommendationCardProps {
  recommendation: Recommendation;
  cartState: CartState;
  onOpenDetail: (rec: Recommendation) => void;
  onRefill: (rec: Recommendation) => void;
  onViewCart: () => void;
}

/* ── Badge de statut ─────────────────────────────────────────── */
function StatusBadge({ rec }: { rec: Recommendation }) {
  const styles: Record<Recommendation["status"], string> = {
    NEW: "bg-forest-900 text-white",
    IN_PROGRESS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    REFILL_DUE: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300",
    COMPLETED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[rec.status]}`}
    >
      {rec.status === "REFILL_DUE" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-600" />
        </span>
      )}
      {rec.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
      {rec.statusLabel}
    </span>
  );
}

/* ── Vignette produit ────────────────────────────────────────── */
function ProductRow({
  name,
  brand,
  price,
  accent,
  discounted,
}: {
  name: string;
  brand?: string;
  price: number;
  accent: string;
  discounted?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white"
        style={{ backgroundColor: accent }}
      >
        <Pill className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight text-slate-900">
          {name}
        </p>
        {brand && brand !== name && (
          <p className="truncate text-[11px] leading-tight text-slate-400">
            {brand}
          </p>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 text-right">
        {discounted != null && discounted !== price ? (
          <>
            <span className="text-[11px] text-slate-400 line-through">
              {formatEuro(price)}
            </span>
            <span className="text-[13px] font-semibold text-slate-900">
              {formatEuro(discounted)}
            </span>
          </>
        ) : (
          <span className="text-[13px] font-semibold text-slate-900">
            {formatEuro(price)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Bloc prix récap ─────────────────────────────────────────── */
function PriceSummary({
  rec,
  emphasis,
}: {
  rec: Recommendation;
  emphasis: "dark" | "amber";
}) {
  return (
    <div className="mt-3 flex items-end justify-between rounded-lg bg-slate-50 px-3 py-2.5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Total
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            {formatEuro(rec.total)}
          </span>
          <span className="text-xs text-slate-400 line-through">
            {formatEuro(rec.subtotal)}
          </span>
        </div>
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
          emphasis === "amber"
            ? "bg-amber-100 text-amber-800"
            : "bg-forest-50 text-forest-900"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {rec.practitioner.discountLabel} avantage praticien
      </span>
    </div>
  );
}

export default function RecommendationCard({
  recommendation: rec,
  cartState,
  onOpenDetail,
  onRefill,
  onViewCart,
}: RecommendationCardProps) {
  const added = cartState === "added";
  const rate = rec.practitioner.discountRate;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
        added
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : rec.status === "REFILL_DUE"
            ? "border-amber-200"
            : "border-slate-200"
      }`}
    >
      {/* En-tête : praticien + statut */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-[11px] font-semibold text-white">
            {rec.practitioner.initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {rec.practitioner.name}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <CalendarDays className="h-3 w-3" />
              {rec.date}
            </p>
          </div>
        </div>
        <StatusBadge rec={rec} />
      </div>

      {/* Produits */}
      <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
        {rec.products.map((p) => (
          <ProductRow
            key={p.id}
            name={p.name}
            brand={p.brand}
            price={p.price}
            accent={p.accent}
            discounted={
              rec.status === "IN_PROGRESS"
                ? undefined
                : Math.round(p.price * (1 - rate) * 100) / 100
            }
          />
        ))}
      </div>

      {/* ── Corps spécifique au statut ─────────────────────────── */}

      {/* NEW */}
      {rec.status === "NEW" && (
        <>
          <p className="mt-3 line-clamp-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm italic text-slate-600">
            « {rec.practitionerNote} »
          </p>
          <PriceSummary rec={rec} emphasis="dark" />
        </>
      )}

      {/* IN_PROGRESS */}
      {rec.status === "IN_PROGRESS" && rec.progress && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              Jour {rec.progress.currentDay} sur {rec.progress.totalDays}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              Fin du pot dans {rec.progress.daysRemaining} jours
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{
                width: `${(rec.progress.currentDay / rec.progress.totalDays) * 100}%`,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          {rec.products[0]?.posology && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
              <Pill className="h-3.5 w-3.5" />
              Posologie : {rec.products[0].posology.label}
            </p>
          )}
        </div>
      )}

      {/* REFILL_DUE */}
      {rec.status === "REFILL_DUE" && rec.refill && (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                {rec.refill.alertLabel}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                <motion.div
                  className="h-full rounded-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(rec.refill.currentDay / rec.refill.cycleDays) * 100}%`,
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
          <p className="flex items-start gap-2 text-xs text-slate-600">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <span className="text-emerald-700">✅</span>{" "}
              {rec.refill.authorizationLabel}
            </span>
          </p>
          <PriceSummary rec={rec} emphasis="amber" />
        </div>
      )}

      {/* COMPLETED */}
      {rec.status === "COMPLETED" && (
        <div className="mt-4">
          <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check className="h-3 w-3" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                Cure terminée le {rec.completedDate}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
              {rec.progress && (
                <p className="mt-1 text-xs text-emerald-700">
                  {rec.progress.totalDays} jours suivis · Jour{" "}
                  {rec.progress.currentDay}/{rec.progress.totalDays}
                </p>
              )}
            </div>
          </div>
          {rec.products[0]?.posology && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
              <Pill className="h-3.5 w-3.5" />
              Posologie suivie : {rec.products[0].posology.label}
            </p>
          )}
          <PriceSummary rec={rec} emphasis="dark" />
        </div>
      )}

      {/* ── Pied : action ─────────────────────────────────────── */}
      <div className="mt-auto pt-4">
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.div
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {rec.status === "REFILL_DUE"
                  ? "Refill ajouté au panier"
                  : rec.status === "COMPLETED"
                    ? "Cure rachetée — ajoutée au panier"
                    : "Recommandation ajoutée au panier"}
              </span>
              <button
                onClick={onViewCart}
                className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
              >
                Voir le panier
              </button>
            </motion.div>
          ) : rec.status === "NEW" ? (
            <motion.button
              key="new"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenDetail(rec)}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
            >
              Consulter &amp; commander
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          ) : rec.status === "IN_PROGRESS" ? (
            <motion.button
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenDetail(rec)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              Voir posologies &amp; détails
            </motion.button>
          ) : rec.status === "COMPLETED" ? (
            <motion.button
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenDetail(rec)}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-50"
            >
              <RotateCcw className="h-4 w-4" />
              Racheter cette cure
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800">
                {rec.practitioner.discountLabel}
              </span>
            </motion.button>
          ) : (
            <motion.button
              key="refill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onRefill(rec)}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-900">
                <Sparkles className="h-3 w-3" />
              </span>
              Prolonger / Refill en 1-Clic
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-bold">
                {rec.practitioner.discountLabel} appliqué
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
