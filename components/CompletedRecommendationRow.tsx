"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import type { Recommendation } from "@/types/recommendation";

interface CompletedRecommendationRowProps {
  recommendation: Recommendation;
}

export default function CompletedRecommendationRow({
  recommendation: rec,
}: CompletedRecommendationRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/recommandations/${rec.id}`}
        className="group flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-[11px] font-semibold text-white">
          {rec.practitioner.initials}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">
            {rec.products.map((p) => p.name).join(", ")}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {rec.practitioner.name} · Terminée le {rec.completedDate}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <Check className="h-3.5 w-3.5" />
          Cure terminée
        </span>

        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors group-hover:border-slate-300">
          Voir
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}
