"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Pill,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import { recommendations as ALL_RECS } from "@/data/mockData";
import { formatEuro, shortDoctor, withDiscount } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Recommendation } from "@/types/recommendation";

const STATUS_STYLES: Record<Recommendation["status"], string> = {
  NEW: "bg-forest-900 text-white",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  REFILL_DUE: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export default function RecommendationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { cartCount, isAdded, addRecommendation, notify } = useCart();

  const rec = useMemo(
    () => ALL_RECS.find((r) => r.id === params.id) ?? null,
    [params.id],
  );

  // Depuis la page détail, tout onglet du header ramène au cockpit.
  const goToTab = () => router.push("/");

  if (!rec) {
    return (
      <>
        <Header
          cartCount={cartCount}
          activeTab="recommandations"
          onTabChange={goToTab}
        />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            Recommandation introuvable.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-forest-900 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-800"
          >
            Retour au cockpit
          </Link>
        </main>
      </>
    );
  }

  const added = isAdded(rec.id);
  const doctor = shortDoctor(rec.practitioner.name);

  const handleRefill = () => {
    const productName = rec.products[0]?.name ?? "Produit";
    addRecommendation(
      rec,
      `${productName} ajouté à votre panier avec l'avantage du ${doctor} !`,
    );
  };

  const handleAddToCart = () => {
    const message =
      rec.status === "COMPLETED"
        ? `Cure « ${rec.products[0]?.name} » relancée et ajoutée à votre panier avec l'avantage du ${doctor} !`
        : `Recommandation du ${doctor} ajoutée à votre panier (${rec.products.length} produit${
            rec.products.length > 1 ? "s" : ""
          }, ${rec.practitioner.discountLabel} appliqué)`;
    addRecommendation(rec, message);
  };

  const viewCart = () =>
    notify(
      `Votre panier contient ${cartCount} article${cartCount > 1 ? "s" : ""}.`,
    );

  return (
    <>
      <Header
        cartCount={cartCount}
        activeTab="recommandations"
        onTabChange={goToTab}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au cockpit
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 space-y-5"
        >
          {/* Titre + statut */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Recommandation
              </p>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                <CalendarDays className="h-5 w-5 text-slate-400" />
                Émise le {rec.date}
              </h1>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[rec.status]}`}
            >
              {rec.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
              {rec.statusLabel}
            </span>
          </div>

          {/* Praticien + mot du médecin */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold text-white">
                {rec.practitioner.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {rec.practitioner.name}
                </p>
                <p className="text-xs text-slate-400">
                  {rec.practitioner.title}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3 rounded-xl bg-forest-50 p-4">
              <Quote className="h-5 w-5 shrink-0 text-forest-700" />
              <p className="text-sm italic leading-relaxed text-forest-900">
                {rec.practitionerNote}
              </p>
            </div>
            {rec.durationLabel && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                {rec.durationLabel}
              </p>
            )}
          </section>

          {/* Produits & posologies */}
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Produits &amp; posologies
            </h2>
            <div className="space-y-2.5">
              {rec.products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: p.accent }}
                    >
                      <Pill className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatEuro(
                          withDiscount(p.price, rec.practitioner.discountRate),
                        )}
                        <span className="ml-1.5 line-through">
                          {formatEuro(p.price)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {p.posology && (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="text-slate-400">Posologie</dt>
                        <dd className="font-medium text-slate-700">
                          {p.posology.label}
                        </dd>
                      </div>
                      {p.posology.containerLabel && (
                        <div>
                          <dt className="text-slate-400">Conditionnement</dt>
                          <dd className="font-medium text-slate-700">
                            {p.posology.containerLabel}
                          </dd>
                        </div>
                      )}
                      {p.posology.daysPerContainer && (
                        <div>
                          <dt className="text-slate-400">Autonomie</dt>
                          <dd className="font-medium text-slate-700">
                            {p.posology.daysPerContainer} jours / contenant
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Suivi (IN_PROGRESS) */}
          {rec.status === "IN_PROGRESS" && rec.progress && (
            <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Suivi de la cure
              </h2>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-blue-800">
                  Jour {rec.progress.currentDay} / {rec.progress.totalDays}
                </span>
                <span className="text-blue-600">
                  Fin du pot dans {rec.progress.daysRemaining} jours
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${(rec.progress.currentDay / rec.progress.totalDays) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-blue-700">
                Le réachat se débloquera automatiquement à 3 jours de la fin du
                pot.
              </p>
            </section>
          )}

          {/* Cure terminée (COMPLETED) */}
          {rec.status === "COMPLETED" && rec.progress && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                Cure terminée
              </h2>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-800">
                  Jour {rec.progress.currentDay} / {rec.progress.totalDays}
                </span>
                {rec.completedDate && (
                  <span className="text-emerald-600">
                    Achevée le {rec.completedDate}
                  </span>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xs text-emerald-700">
                Protocole mené à terme. Vous pouvez le relancer à l&apos;identique,
                l&apos;avantage praticien est conservé.
              </p>
            </section>
          )}

          {/* Renouvellement (REFILL_DUE) */}
          {rec.status === "REFILL_DUE" && rec.refill && (
            <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Renouvellement
              </h2>
              <p className="flex items-start gap-2 text-sm font-semibold text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                {rec.refill.alertLabel}
              </p>
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ✅ {rec.refill.authorizationLabel}
              </p>
              <div className="flex gap-2 pt-1">
                {Array.from({ length: rec.refill.authorizedRefills }).map(
                  (_, i) => (
                    <span
                      key={i}
                      className={`flex-1 rounded-md px-2 py-1 text-center text-[11px] font-semibold ${
                        i < rec.refill!.currentRefillIndex
                          ? "bg-emerald-600 text-white"
                          : "bg-white text-slate-400 ring-1 ring-inset ring-slate-200"
                      }`}
                    >
                      Refill {i + 1}
                    </span>
                  ),
                )}
              </div>
            </section>
          )}

          {/* Récap prix */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Sous-total</span>
              <span className="text-slate-500 line-through">
                {formatEuro(rec.subtotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Avantage {doctor} ({rec.practitioner.discountLabel})
              </span>
              <span className="font-medium text-emerald-700">
                −{formatEuro(rec.subtotal - rec.total)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {formatEuro(rec.total)}
              </span>
            </div>
          </section>

          {/* Action */}
          <div className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg shadow-slate-200/60 backdrop-blur">
            {added ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  Ajouté à votre panier
                </span>
                <button
                  onClick={viewCart}
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  Voir le panier
                </button>
              </div>
            ) : rec.status === "IN_PROGRESS" ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"
              >
                Réachat disponible à J-3 de la fin du pot
              </button>
            ) : rec.status === "REFILL_DUE" ? (
              <button
                onClick={handleRefill}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-900">
                  <Sparkles className="h-3 w-3" />
                </span>
                Refill en 1-Clic — {formatEuro(rec.total)}
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
              >
                {rec.status === "COMPLETED"
                  ? "Racheter la cure"
                  : "Ajouter au panier"}{" "}
                — {formatEuro(rec.total)}
              </button>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
