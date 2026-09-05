"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AutoRefillToggle from "@/components/AutoRefillToggle";
import Header from "@/components/Header";
import ProductPicker from "@/components/ProductPicker";
import { patients, productCatalog } from "@/data/mockData";
import { useRecommendations } from "@/lib/recommendations";
import type { Product } from "@/types/recommendation";

export default function NouvelleRecommandationPage() {
  const router = useRouter();
  const { createRecommendation } = useRecommendations();

  const [patientId, setPatientId] = useState(patients[0].id);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([
    productCatalog[0],
  ]);
  const [note, setNote] = useState("");
  const [durationLabel, setDurationLabel] = useState("");
  const [plannedContainers, setPlannedContainers] = useState(1);
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(true);

  const canSubmit = selectedProducts.length > 0 && note.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const patient = patients.find((p) => p.id === patientId) ?? patients[0];
    createRecommendation({
      patient,
      products: selectedProducts,
      practitionerNote: note.trim(),
      durationLabel: durationLabel.trim() || undefined,
      plannedContainers,
      autoRefillEnabled,
    });
    router.push("/praticien");
  };

  return (
    <>
      <Header cartCount={0} activeTab="recommandations" onTabChange={() => {}} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <Link
          href="/praticien"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au suivi
        </Link>

        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-slate-900">
          Nouvelle recommandation
        </h1>
        <p className="mt-1 text-sm text-slate-500">Dr. Marco De Bona</p>

        <div className="mt-6 space-y-6">
          {/* Patient */}
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Patient
            </h2>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-forest-400"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Produits */}
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Produits &amp; posologie
            </h2>
            <ProductPicker
              catalog={productCatalog}
              selected={selectedProducts}
              onChange={setSelectedProducts}
            />
          </div>

          {/* Note praticien */}
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mot pour le patient
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ex : Bonjour, voici ma recommandation..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-forest-400"
            />
          </div>

          {/* Durée + nombre de boîtes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Durée (optionnel)
              </h2>
              <input
                value={durationLabel}
                onChange={(e) => setDurationLabel(e.target.value)}
                placeholder="Ex : Cure de 90 jours"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-forest-400"
              />
            </div>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Boîtes prévues
              </h2>
              <input
                type="number"
                min={1}
                value={plannedContainers}
                onChange={(e) =>
                  setPlannedContainers(Math.max(1, Number(e.target.value)))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-forest-400"
              />
            </div>
          </div>

          {/* Auto-refill */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Renouvellement automatique
              </p>
              <p className="mt-0.5 max-w-sm text-xs text-slate-500">
                {autoRefillEnabled
                  ? "Le patient sera alerté automatiquement à l'approche de la fin du pot."
                  : "Vous garderez la main : le patient ne verra pas d'alerte, à vous de le relancer depuis votre espace."}
              </p>
            </div>
            <AutoRefillToggle
              enabled={autoRefillEnabled}
              onChange={setAutoRefillEnabled}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Envoyer la recommandation
          </button>
        </div>
      </main>
    </>
  );
}
