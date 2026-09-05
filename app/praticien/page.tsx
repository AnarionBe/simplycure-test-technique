"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Send, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/format";
import { defaultReminderText, needsManualAttention } from "@/lib/refill";
import { useRecommendations } from "@/lib/recommendations";
import type { Recommendation } from "@/types/recommendation";

const STATUS_STYLES: Record<Recommendation["status"], string> = {
  NEW: "bg-forest-900 text-white",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  REFILL_DUE: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

/* ── Carte "à traiter manuellement" ──────────────────────────── */
function ManualFollowUpCard({ rec }: { rec: Recommendation }) {
  const { sendMessage } = useRecommendations();
  const { notify } = useCart();
  const [text, setText] = useState(defaultReminderText(rec));

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(rec.id, text);
    notify(`Message envoyé au patient pour « ${rec.products[0]?.name} »`);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {rec.products.map((p) => p.name).join(", ")}
          </p>
          {rec.refill && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {rec.refill.alertLabel}
            </p>
          )}
        </div>
        <Link
          href={`/praticien/recommandations/${rec.id}`}
          className="shrink-0 text-xs font-medium text-forest-700 hover:text-forest-900"
        >
          Voir la reco
        </Link>
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-forest-400"
        />
        <button
          onClick={handleSend}
          className="flex shrink-0 items-center gap-1.5 self-end rounded-lg bg-forest-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
        >
          <Send className="h-3.5 w-3.5" />
          Envoyer
        </button>
      </div>
    </div>
  );
}

/* ── Ligne "toutes les recommandations" ──────────────────────── */
function RecommendationRow({ rec }: { rec: Recommendation }) {
  return (
    <Link
      href={`/praticien/recommandations/${rec.id}`}
      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">
          {rec.products.map((p) => p.name).join(", ")}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {rec.date} · {formatEuro(rec.total)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[rec.status]}`}
        >
          {rec.statusLabel}
        </span>
        <span
          className={`text-xs font-medium ${rec.autoRefillEnabled ? "text-emerald-700" : "text-slate-400"}`}
        >
          Refill auto {rec.autoRefillEnabled ? "activé" : "désactivé"}
        </span>
      </div>
    </Link>
  );
}

export default function PraticienPage() {
  const { recommendations } = useRecommendations();
  const toWatch = recommendations.filter(needsManualAttention);

  return (
    <>
      <Header cartCount={0} activeTab="recommandations" onTabChange={() => {}} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <div className="flex items-start gap-2.5 rounded-xl border border-forest-900/10 bg-forest-50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
          <p className="text-sm text-forest-900">
            <span className="font-semibold">Espace praticien (démo) —</span>{" "}
            quand l&apos;auto-refill est désactivé, le patient ne voit aucune
            alerte : c&apos;est ici que vous gardez la main pour le relancer.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Suivi des recommandations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Dr. Marco De Bona · patient unique de la démo
            </p>
          </div>
          <Link
            href="/praticien/nouvelle"
            className="flex items-center gap-1.5 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
          >
            <Plus className="h-4 w-4" />
            Nouvelle recommandation
          </Link>
        </div>

        <section className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
            À traiter manuellement ({toWatch.length})
          </h2>
          {toWatch.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              Rien à relancer manuellement pour le moment.
            </p>
          ) : (
            <motion.div layout className="space-y-3">
              {toWatch.map((rec) => (
                <ManualFollowUpCard key={rec.id} rec={rec} />
              ))}
            </motion.div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Toutes les recommandations ({recommendations.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {recommendations.map((rec) => (
              <RecommendationRow key={rec.id} rec={rec} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
