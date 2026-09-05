"use client";

import { Check, Pill } from "lucide-react";
import { formatEuro } from "@/lib/format";
import type { Product } from "@/types/recommendation";

/**
 * Sélection des produits d'une recommandation + édition de la posologie (dose/fréquence) de
 * chaque produit retenu. `selected` porte les éventuelles personnalisations déjà faites (elles
 * peuvent différer des valeurs par défaut du catalogue) ; `catalog` liste tout ce qui est
 * disponible pour ajout/retrait.
 *
 * Le rapprochement catalogue <-> sélection se fait par nom de produit, pas par id : chaque
 * recommandation mockée porte sa propre instance de produit (id distinct, posologie propre) pour
 * un même produit du catalogue, donc l'id catalogue ne correspond pas forcément à celui déjà
 * présent dans la recommandation.
 */
export default function ProductPicker({
  catalog,
  selected,
  onChange,
}: {
  catalog: Product[];
  selected: Product[];
  onChange: (products: Product[]) => void;
}) {
  const toggle = (product: Product) => {
    const isSelected = selected.some((p) => p.name === product.name);
    onChange(
      isSelected
        ? selected.filter((p) => p.name !== product.name)
        : [...selected, product],
    );
  };

  const updatePosology = (
    productName: string,
    field: "dose" | "frequency",
    value: string,
  ) => {
    onChange(
      selected.map((p) => {
        if (p.name !== productName || !p.posology) return p;
        const posology = { ...p.posology, [field]: value };
        posology.label = `${posology.dose} ${posology.frequency}`;
        return { ...p, posology };
      }),
    );
  };

  return (
    <div className="space-y-2">
      {catalog.map((product) => {
        const current = selected.find((p) => p.name === product.name);
        const isSelected = !!current;
        return (
          <div
            key={product.id}
            className={`rounded-xl border p-3 transition-colors ${
              isSelected
                ? "border-forest-300 bg-forest-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(product)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: product.accent }}
              >
                <Pill className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">
                  {product.name}
                </span>
                {product.posology?.containerLabel && (
                  <span className="block text-xs text-slate-400">
                    {product.posology.containerLabel}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-medium text-slate-500">
                {formatEuro(product.price)}
              </span>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-forest-700" />
              )}
            </button>

            {current?.posology && (
              <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-forest-100 pt-2.5">
                <label className="block text-xs text-slate-500">
                  Dose
                  <input
                    value={current.posology.dose}
                    onChange={(e) =>
                      updatePosology(product.name, "dose", e.target.value)
                    }
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-forest-400"
                  />
                </label>
                <label className="block text-xs text-slate-500">
                  Fréquence
                  <input
                    value={current.posology.frequency}
                    onChange={(e) =>
                      updatePosology(product.name, "frequency", e.target.value)
                    }
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-forest-400"
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
