"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import { patients } from "@/data/mockData";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/format";
import { defaultReminderText, needsManualAttention } from "@/lib/refill";
import { useRecommendations } from "@/lib/recommendations";
import type { Recommendation } from "@/types/recommendation";

const STATUS_STYLES: Record<Recommendation["status"], string> = {
  NEW: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 uppercase tracking-wide",
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 uppercase tracking-wide",
  REFILL_DUE:
    "bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-300 uppercase tracking-wide",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 uppercase tracking-wide",
};

/** Trie du plus urgent au moins urgent (fin de pot la plus proche en premier). */
function byUrgency(a: Recommendation, b: Recommendation): number {
  return (a.refill?.daysUntilEmpty ?? 0) - (b.refill?.daysUntilEmpty ?? 0);
}

function PatientAvatar({ rec }: { rec: Recommendation }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">
      {rec.patient.initials}
    </span>
  );
}

/* ── KPI en tête de dashboard ────────────────────────────────── */
function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "slate";
}) {
  const toneStyles: Record<typeof tone, string> = {
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    slate: "text-slate-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className={`text-2xl font-bold ${toneStyles[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

/* ── Carte "à traiter manuellement", triée par urgence ───────── */
function ManualFollowUpCard({ rec }: { rec: Recommendation }) {
  const { sendMessage } = useRecommendations();
  const { notify } = useCart();
  const [text, setText] = useState(defaultReminderText(rec));

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(rec.id, text);
    notify(`Message envoyé à ${rec.patient.name} pour « ${rec.products[0]?.name} »`);
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <PatientAvatar rec={rec} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {rec.patient.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {rec.products.map((p) => p.name).join(", ")}
            </p>
            {rec.refill && (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {rec.refill.alertLabel}
              </p>
            )}
          </div>
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

/* ── Ligne "renouvellement automatique à venir" (informatif, rien à faire) ── */
function AutoRefillRow({ rec }: { rec: Recommendation }) {
  return (
    <Link
      href={`/praticien/recommandations/${rec.id}`}
      className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 transition-colors hover:bg-emerald-50"
    >
      <PatientAvatar rec={rec} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{rec.patient.name}</p>
        <p className="truncate text-xs text-slate-500">
          {rec.products.map((p) => p.name).join(", ")}
        </p>
      </div>
      {rec.refill && (
        <span className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-emerald-700">
          <Clock className="h-3.5 w-3.5" />
          J-{rec.refill.daysUntilEmpty}
        </span>
      )}
      <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
        <ShieldCheck className="h-3 w-3" />
        Automatique
      </span>
    </Link>
  );
}

/* ── Ligne "toutes les recommandations" ──────────────────────── */
function RecommendationRow({ rec }: { rec: Recommendation }) {
  return (
    <Link
      href={`/praticien/recommandations/${rec.id}`}
      className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <PatientAvatar rec={rec} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">{rec.patient.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {rec.products.map((p) => p.name).join(", ")} · {rec.date} ·{" "}
            {formatEuro(rec.total)}
          </p>
        </div>
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
  const [query, setQuery] = useState("");

  const toWatch = useMemo(
    () => recommendations.filter(needsManualAttention).sort(byUrgency),
    [recommendations],
  );

  const upcomingAuto = useMemo(
    () =>
      recommendations
        .filter((r) => r.status === "REFILL_DUE" && r.autoRefillEnabled)
        .sort(byUrgency),
    [recommendations],
  );

  const newCount = recommendations.filter((r) => r.status === "NEW").length;

  const filteredRecs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recommendations;
    return recommendations.filter(
      (r) =>
        r.patient.name.toLowerCase().includes(q) ||
        r.products.some((p) => p.name.toLowerCase().includes(q)),
    );
  }, [recommendations, query]);

  return (
    <>
      <Header cartCount={0} activeTab="recommandations" onTabChange={() => {}} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <div className="flex items-start gap-2.5 rounded-xl border border-forest-900/10 bg-forest-50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
          <p className="text-sm text-forest-900">
            <span className="font-semibold">Espace praticien (démo) —</span>{" "}
            un dashboard trié par urgence plutôt qu&apos;une liste plate :
            avec {patients.length} patients actifs, vous voyez en un coup
            d&apos;œil qui relancer en premier, et ce qui tourne tout seul.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
              Suivi des recommandations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Dr. Marco De Bona · {patients.length} patients suivis
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

        {/* KPI */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="À relancer maintenant" value={toWatch.length} tone="amber" />
          <KpiCard
            label="Renouvellements automatiques en cours"
            value={upcomingAuto.length}
            tone="emerald"
          />
          <KpiCard label="Nouvelles non consultées" value={newCount} tone="slate" />
          <KpiCard label="Patients actifs" value={patients.length} tone="slate" />
        </div>

        <section className="mt-8">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />À relancer, du plus urgent
            au moins urgent ({toWatch.length})
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
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Renouvellements automatiques à venir — rien à faire ({upcomingAuto.length})
          </h2>
          {upcomingAuto.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              Aucun renouvellement automatique en attente.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAuto.map((rec) => (
                <AutoRefillRow key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Toutes les recommandations ({filteredRecs.length})
            </h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un patient ou un produit..."
                className="w-64 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-forest-400"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {filteredRecs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Aucune recommandation ne correspond à la recherche.
              </p>
            ) : (
              filteredRecs.map((rec) => (
                <RecommendationRow key={rec.id} rec={rec} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
