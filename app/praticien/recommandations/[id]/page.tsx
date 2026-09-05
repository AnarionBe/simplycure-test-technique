"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Pill,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AutoRefillToggle from "@/components/AutoRefillToggle";
import Header from "@/components/Header";
import ProductPicker from "@/components/ProductPicker";
import { productCatalog } from "@/data/mockData";
import { useCart } from "@/lib/cart";
import { formatEuro } from "@/lib/format";
import { defaultReminderText } from "@/lib/refill";
import { useRecommendations } from "@/lib/recommendations";
import type { Product, Recommendation } from "@/types/recommendation";

const STATUS_STYLES: Record<Recommendation["status"], string> = {
  NEW: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 uppercase tracking-wide",
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 uppercase tracking-wide",
  REFILL_DUE:
    "bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-300 uppercase tracking-wide",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 uppercase tracking-wide",
};

/* ── Historique des échanges autour de cette recommandation ─────── */
function MessageHistory({ recId }: { recId: string }) {
  const { messages } = useRecommendations();
  const thread = messages
    .filter((m) => m.recommendationId === recId)
    .slice()
    .reverse();

  if (thread.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-sm text-slate-400">
        Aucun échange pour le moment.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {thread.map((m) => (
        <div key={m.id} className="px-4 py-3">
          <p className="text-sm leading-snug text-slate-700">{m.text}</p>
          <p className="mt-1 text-xs text-slate-400">{m.date} · envoyé au patient</p>
        </div>
      ))}
    </div>
  );
}

/* ── Bloc "modifier le renouvellement automatique" (justification obligatoire) ── */
function AutoRefillEditor({ rec }: { rec: Recommendation }) {
  const { changeAutoRefill } = useRecommendations();
  const { notify } = useCart();
  const [pending, setPending] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");

  const confirm = () => {
    if (pending === null || !reason.trim()) return;
    changeAutoRefill(rec.id, pending, reason);
    notify("Modification envoyée au patient avec votre explication.");
    setPending(null);
    setReason("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Renouvellement automatique
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {rec.autoRefillEnabled
              ? "Activé : le patient est alerté automatiquement."
              : "Désactivé : vous gardez la main pour relancer le patient."}
          </p>
        </div>
        <AutoRefillToggle
          enabled={pending ?? rec.autoRefillEnabled}
          onChange={(next) => setPending(next)}
        />
      </div>

      {pending !== null && pending !== rec.autoRefillEnabled && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <label className="block text-xs font-medium text-slate-600">
            Expliquez ce changement au patient (obligatoire)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Ex : je préfère qu'on refasse le point ensemble avant de relancer un pot."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-forest-400"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setPending(null);
                setReason("");
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={!reason.trim()}
              className="rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmer et prévenir le patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Bloc "modifier la composition" (justification obligatoire) ─── */
function CompositionEditor({ rec }: { rec: Recommendation }) {
  const { changeComposition } = useRecommendations();
  const { notify } = useCart();
  const [editing, setEditing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    rec.products,
  );
  const [reason, setReason] = useState("");

  const confirm = () => {
    if (selectedProducts.length === 0 || !reason.trim()) return;
    changeComposition(rec.id, selectedProducts, reason);
    notify("Composition mise à jour, le patient a été prévenu.");
    setEditing(false);
    setReason("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Composition</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-forest-700 hover:text-forest-900"
          >
            Modifier
          </button>
        )}
      </div>

      {!editing ? (
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {rec.products.map((p) => (
            <li key={p.id}>
              {p.name}
              {p.posology && (
                <span className="text-slate-400"> · {p.posology.label}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          <ProductPicker
            catalog={productCatalog}
            selected={selectedProducts}
            onChange={setSelectedProducts}
          />
          <label className="block text-xs font-medium text-slate-600">
            Expliquez ce changement au patient (obligatoire)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Ex : on ajoute du magnésium en complément pour la suite de la cure."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-forest-400"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Annuler
            </button>
            <button
              onClick={confirm}
              disabled={selectedProducts.length === 0 || !reason.trim()}
              className="rounded-lg bg-forest-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirmer et prévenir le patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Contacter le patient (message libre + rappel standard en 1 clic) ── */
function ContactPatient({ rec }: { rec: Recommendation }) {
  const { sendMessage } = useRecommendations();
  const { notify } = useCart();
  const [text, setText] = useState("");

  const sendCustom = () => {
    if (!text.trim()) return;
    sendMessage(rec.id, text);
    notify("Message envoyé au patient.");
    setText("");
  };

  const sendStandard = () => {
    sendMessage(rec.id, defaultReminderText(rec));
    notify("Rappel standard envoyé au patient.");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">Contacter le patient</p>
      <div className="mt-3 flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Écrire un message personnalisé..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-forest-400"
        />
        <button
          onClick={sendCustom}
          disabled={!text.trim()}
          className="flex shrink-0 items-center gap-1.5 self-end rounded-lg bg-forest-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          Envoyer
        </button>
      </div>
      <button
        onClick={sendStandard}
        className="mt-2 text-xs font-medium text-forest-700 hover:text-forest-900"
      >
        Ou envoyer le rappel standard en un clic →
      </button>
    </div>
  );
}

export default function PraticienRecommandationPage() {
  const params = useParams<{ id: string }>();
  const { recommendations } = useRecommendations();
  const rec = recommendations.find((r) => r.id === params.id) ?? null;

  if (!rec) {
    return (
      <>
        <Header cartCount={0} activeTab="recommandations" onTabChange={() => {}} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            Recommandation introuvable.
          </p>
          <Link
            href="/praticien"
            className="mt-4 inline-block rounded-lg bg-forest-900 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
          >
            Retour au suivi
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header cartCount={0} activeTab="recommandations" onTabChange={() => {}} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <Link
          href="/praticien"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au suivi
        </Link>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-forest-900/10 bg-forest-50 px-4 py-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
          <p className="text-sm text-forest-900">
            Vue praticien — pas d&apos;achat ici, seulement le récapitulatif et
            vos options pour contacter ou ajuster la recommandation du patient.
          </p>
        </div>

        {/* Récapitulatif */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">
                {rec.patient.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {rec.patient.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <CalendarDays className="h-3 w-3" />
                  Émise le {rec.date}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[rec.status]}`}
            >
              {rec.statusLabel}
            </span>
          </div>

          <div className="mt-3 flex gap-3 rounded-xl bg-forest-50 p-4">
            <Quote className="h-5 w-5 shrink-0 text-forest-700" />
            <p className="text-sm italic leading-relaxed text-forest-900">
              {rec.practitionerNote}
            </p>
          </div>

          <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
            {rec.products.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ backgroundColor: p.accent }}
                >
                  <Pill className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  {p.posology && (
                    <p className="text-xs text-slate-400">
                      {p.posology.label}
                      {p.posology.containerLabel && ` · ${p.posology.containerLabel}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{rec.plannedContainers} boîte(s) prévue(s) au total</span>
            <span className="font-medium text-slate-700">
              {formatEuro(rec.total)}
            </span>
          </div>

          {rec.refill && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium">{rec.refill.alertLabel}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-800">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  Refill {rec.refill.currentRefillIndex}/{rec.refill.authorizedRefills}
                </p>
              </div>
            </div>
          )}

          {rec.progress && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Jour {rec.progress.currentDay} / {rec.progress.totalDays}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <ContactPatient key={`contact-${rec.id}`} rec={rec} />
          <AutoRefillEditor key={`refill-${rec.id}`} rec={rec} />
          <CompositionEditor key={`composition-${rec.id}`} rec={rec} />
        </div>

        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Historique des échanges
          </h2>
          <MessageHistory recId={rec.id} />
        </section>
      </main>
    </>
  );
}
