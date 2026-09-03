"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Minus,
  Pill,
  Plus,
  Quote,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import Header from "@/components/Header";
import { recommendations as ALL_RECS } from "@/data/mockData";
import { formatEuro, shortDoctor, withDiscount } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Product, Recommendation } from "@/types/recommendation";

const STATUS_STYLES: Record<Recommendation["status"], string> = {
  NEW: "bg-forest-900 text-white",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  REFILL_DUE: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

/* ─────────────────────────────────────────────────────────────
 * Colonne gauche — même contenu que la carte, en plus grand
 * ───────────────────────────────────────────────────────────── */
function RecoOverview({ rec }: { rec: Recommendation }) {
  return (
    <div className="space-y-6 lg:col-span-2">
      {/* En-tête praticien + statut */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold text-white">
            {rec.practitioner.initials}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900">
              {rec.practitioner.name}
            </p>
            <p className="text-sm text-slate-400">{rec.practitioner.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Émise le {rec.date}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[rec.status]}`}
        >
          {rec.status === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
          {rec.statusLabel}
        </span>
      </div>

      {/* Mot du médecin */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex gap-3 rounded-xl bg-forest-50 p-4">
          <Quote className="h-5 w-5 shrink-0 text-forest-700" />
          <p className="text-[15px] italic leading-relaxed text-forest-900">
            {rec.practitionerNote}
          </p>
        </div>
        {rec.durationLabel && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {rec.durationLabel}
          </p>
        )}
      </div>

      {/* Produits & infos de prise */}
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Produits &amp; posologies
        </h2>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rec.products.map((p) => (
            <div key={p.id} className="flex items-start gap-4 p-5">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: p.accent }}
              >
                <Pill className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">{p.name}</p>

                {p.posology ? (
                  <>
                    <p className="mt-1 flex items-center gap-2 text-lg font-bold leading-tight text-forest-900">
                      <Clock className="h-4 w-4 shrink-0 text-forest-700" />
                      {p.posology.label}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                      {p.posology.containerLabel && (
                        <span>{p.posology.containerLabel}</span>
                      )}
                      {p.posology.daysPerContainer && (
                        <span>
                          {p.posology.daysPerContainer} jours d&apos;autonomie
                        </span>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloc contextuel selon le statut */}
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
            Le réachat se débloquera automatiquement à 3 jours de la fin du pot.
          </p>
        </section>
      )}

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
            {Array.from({ length: rec.refill.authorizedRefills }).map((_, i) => (
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
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Colonne droite — produits en version achat (1/3)
 * ───────────────────────────────────────────────────────────── */
function PurchaseProductCard({
  rec,
  product,
  onAdd,
}: {
  rec: Recommendation;
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const unit = withDiscount(product.price, rec.practitioner.discountRate);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: product.accent }}
        >
          <Pill className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-slate-900">
            {product.name}
          </p>
          {product.posology?.containerLabel && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {product.posology.containerLabel}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-slate-900">
            {formatEuro(unit)}
          </p>
          <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px]">
            <span className="rounded bg-emerald-100 px-1 py-0.5 font-bold text-emerald-700">
              {rec.practitioner.discountLabel}
            </span>
            <span className="text-slate-400 line-through">
              {formatEuro(product.price)}
            </span>
          </p>
        </div>
      </div>

      {product.posology && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-600">Votre cure</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Prendre</span>
            {rec.durationLabel && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {rec.durationLabel}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
              {product.posology.label}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <div className="flex items-center rounded-lg border border-slate-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuer la quantité"
            className="px-2.5 py-2 text-slate-500 transition-colors hover:text-slate-800"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-7 text-center text-sm font-medium text-slate-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => q + 1)}
            aria-label="Augmenter la quantité"
            className="px-2.5 py-2 text-slate-500 transition-colors hover:text-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          onClick={() => onAdd(product, qty)}
          className="flex-1 rounded-lg bg-forest-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

function PurchasePanel({
  rec,
  onAddAll,
  onAddProduct,
}: {
  rec: Recommendation;
  onAddAll: () => void;
  onAddProduct: (product: Product, quantity: number) => void;
}) {
  const n = rec.products.length;
  const saved = rec.subtotal - rec.total;

  return (
    <aside className="space-y-4 lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-slate-900">Produits</h2>
        <span className="text-xs text-slate-400">
          {n} produit{n > 1 ? "s" : ""} recommandé{n > 1 ? "s" : ""}
        </span>
      </div>

      {/* Total recommandation */}
      <div className="rounded-2xl border border-forest-900/10 bg-forest-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-forest-700/80">
          Total recommandation
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-bold text-forest-900">
            {formatEuro(rec.total)}
          </span>
          <span className="text-sm text-slate-400 line-through">
            {formatEuro(rec.subtotal)}
          </span>
          <span className="rounded-full bg-forest-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {rec.practitioner.discountLabel}
          </span>
        </div>
        <p className="mt-1 text-xs text-forest-800">
          Vous économisez {formatEuro(saved)}
        </p>
        <button
          onClick={onAddAll}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
        >
          <ShoppingCart className="h-4 w-4" />
          Tout ajouter au panier
        </button>
      </div>

      <div className="space-y-3">
        {rec.products.map((p) => (
          <PurchaseProductCard
            key={p.id}
            rec={rec}
            product={p}
            onAdd={onAddProduct}
          />
        ))}
      </div>
    </aside>
  );
}

/* ───────────────────────────────────────────────────────────── */
export default function RecommendationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { cartCount, addRecommendation, addProduct } = useCart();

  const rec = useMemo(
    () => ALL_RECS.find((r) => r.id === params.id) ?? null,
    [params.id],
  );

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

  const doctor = shortDoctor(rec.practitioner.name);

  const handleAddAll = () =>
    addRecommendation(
      rec,
      `Recommandation du ${doctor} ajoutée à votre panier (${rec.products.length} produit${
        rec.products.length > 1 ? "s" : ""
      }, ${rec.practitioner.discountLabel} appliqué)`,
    );

  const handleAddProduct = (product: Product, quantity: number) =>
    addProduct(
      rec,
      product,
      quantity,
      `${product.name}${quantity > 1 ? ` ×${quantity}` : ""} ajouté à votre panier avec l'avantage du ${doctor} !`,
    );

  return (
    <>
      <Header
        cartCount={cartCount}
        activeTab="recommandations"
        onTabChange={goToTab}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
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
          className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <RecoOverview rec={rec} />
          <PurchasePanel
            rec={rec}
            onAddAll={handleAddAll}
            onAddProduct={handleAddProduct}
          />
        </motion.div>
      </main>
    </>
  );
}
