"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
  Pill,
  Clock,
  CalendarDays,
} from "lucide-react";
import type { CartState, Recommendation } from "@/types/recommendation";
import { formatEuro } from "@/lib/format";

interface RecommendationCardProps {
  recommendation: Recommendation;
  cartState: CartState;
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
        {rec.practitioner.discountLabel} praticien
      </span>
    </div>
  );
}

export default function RecommendationCard({
  recommendation: rec,
  cartState,
}: RecommendationCardProps) {
  const added = cartState === "added";
  const rate = rec.practitioner.discountRate;
  const detailHref = `/recommandations/${rec.id}`;

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

      {/* 1 · Note du médecin (scrollable si longue) */}
      <div className="mt-3 max-h-28 overflow-y-auto overscroll-contain rounded-lg bg-slate-50 px-3 py-2 text-[13px] italic leading-snug text-slate-600 [scrollbar-width:thin]">
        « {rec.practitionerNote} »
      </div>

      {/* 2 · Liste des produits */}
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

      {/* Détail contextuel selon le statut */}
      {rec.status === "IN_PROGRESS" && rec.progress && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-600">
              Jour {rec.progress.currentDay} / {rec.progress.totalDays}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              Fin du pot dans {rec.progress.daysRemaining} j
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{
                width: `${(rec.progress.currentDay / rec.progress.totalDays) * 100}%`,
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {rec.status === "REFILL_DUE" && rec.refill && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
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
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-800">
            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600" />
            Refill {rec.refill.currentRefillIndex}/{rec.refill.authorizedRefills}{" "}
            autorisé par le praticien
          </p>
        </div>
      )}

      {rec.status === "COMPLETED" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-800">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-3 w-3" />
          </span>
          Cure terminée le {rec.completedDate}
        </div>
      )}

      {/* 3 · Total */}
      <PriceSummary
        rec={rec}
        emphasis={rec.status === "REFILL_DUE" ? "amber" : "dark"}
      />

      {/* 4 · Action unique (footer) — identique pour tous les statuts */}
      <div className="mt-auto pt-4">
        <Link
          href={detailHref}
          className="group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
        >
          Ouvrir la recommandation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}
