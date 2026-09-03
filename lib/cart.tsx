"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Toast, { type ToastData } from "@/components/Toast";
import { withDiscount } from "@/lib/format";
import type {
  CartLine,
  Product,
  Recommendation,
} from "@/types/recommendation";

const STORAGE_KEY = "simplycure.cart.v1";

interface PersistedState {
  cart: CartLine[];
  addedRecIds: string[];
}

interface CartContextValue {
  cart: CartLine[];
  cartCount: number;
  /** true si la recommandation a déjà été ajoutée au panier */
  isAdded: (recId: string) => boolean;
  /** Ajoute tous les produits d'une recommandation + déclenche un toast */
  addRecommendation: (rec: Recommendation, message: string) => void;
  /** Ajoute un seul produit d'une recommandation, avec quantité */
  addProduct: (
    rec: Recommendation,
    product: Product,
    quantity: number,
    message: string,
  ) => void;
  /** Affiche un toast sans toucher au panier */
  notify: (message: string) => void;
  /** Vide le panier (bouton "Réinitialiser la démo") */
  reset: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [addedRecIds, setAddedRecIds] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Chargement initial depuis le localStorage (persiste la nav entre pages)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setCart(parsed.cart ?? []);
        setAddedRecIds(parsed.addedRecIds ?? []);
      }
    } catch {
      /* stockage indisponible : on repart d'un panier vide */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cart, addedRecIds } satisfies PersistedState),
      );
    } catch {
      /* quota / mode privé : on ignore */
    }
  }, [cart, addedRecIds, hydrated]);

  const cartCount = useMemo(
    () => cart.reduce((n, line) => n + line.quantity, 0),
    [cart],
  );

  const isAdded = useCallback(
    (recId: string) => addedRecIds.includes(recId),
    [addedRecIds],
  );

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const addRecommendation = useCallback(
    (rec: Recommendation, message: string) => {
      setCart((prev) => {
        const lines: CartLine[] = rec.products.map((p) => ({
          productId: p.id,
          name: p.name,
          unitPrice: withDiscount(p.price, rec.practitioner.discountRate),
          quantity: 1,
          recommendationId: rec.id,
          practitionerName: rec.practitioner.name,
        }));
        return [...prev, ...lines];
      });
      setAddedRecIds((prev) =>
        prev.includes(rec.id) ? prev : [...prev, rec.id],
      );
      notify(message);
    },
    [notify],
  );

  const addProduct = useCallback(
    (
      rec: Recommendation,
      product: Product,
      quantity: number,
      message: string,
    ) => {
      setCart((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: withDiscount(product.price, rec.practitioner.discountRate),
          quantity,
          recommendationId: rec.id,
          practitionerName: rec.practitioner.name,
        },
      ]);
      setAddedRecIds((prev) =>
        prev.includes(rec.id) ? prev : [...prev, rec.id],
      );
      notify(message);
    },
    [notify],
  );

  const reset = useCallback(() => {
    setCart([]);
    setAddedRecIds([]);
    setToast(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartCount,
      isAdded,
      addRecommendation,
      addProduct,
      notify,
      reset,
    }),
    [cart, cartCount, isAdded, addRecommendation, addProduct, notify, reset],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
