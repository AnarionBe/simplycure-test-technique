"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { recommendations as SEED_RECS, drDeBona } from "@/data/mockData";
import { withDiscount } from "@/lib/format";
import type {
  Patient,
  PractitionerMessage,
  Product,
  Recommendation,
} from "@/types/recommendation";

const STORAGE_KEY = "simplycure.recs.v2";

interface PersistedState {
  /** Champs modifiés après création, par id de recommandation (refill auto, composition...) */
  overrides: Record<string, Partial<Recommendation>>;
  /** Recommandations créées depuis l'espace praticien (en plus du seed mocké) */
  createdRecs: Recommendation[];
  messages: PractitionerMessage[];
}

export interface NewRecommendationInput {
  patient: Patient;
  products: Product[];
  practitionerNote: string;
  durationLabel?: string;
  plannedContainers: number;
  autoRefillEnabled: boolean;
}

interface RecommendationsContextValue {
  recommendations: Recommendation[];
  /**
   * Active/désactive le renouvellement automatique. Toute modification doit être justifiée :
   * la raison est envoyée au patient sous forme de message (traçabilité, pas de changement
   * silencieux).
   */
  changeAutoRefill: (recId: string, enabled: boolean, reason: string) => void;
  /** Modifie la composition (produits) d'une recommandation, avec la même exigence de justification. */
  changeComposition: (
    recId: string,
    products: Product[],
    reason: string,
  ) => void;
  /** Crée une nouvelle recommandation (statut NEW) depuis l'espace praticien. */
  createRecommendation: (input: NewRecommendationInput) => Recommendation;
  messages: PractitionerMessage[];
  /** Envoie un message praticien -> patient pour une recommandation donnée (mocké). */
  sendMessage: (recId: string, text: string) => void;
  /** Nombre de messages praticien non lus (notifications système exclues). */
  unreadCount: number;
  /** Marque tous les messages praticien comme lus. */
  markAllRead: () => void;
}

const RecommendationsContext = createContext<RecommendationsContextValue | null>(
  null,
);

function todayLabel(): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export function RecommendationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [overrides, setOverrides] = useState<
    Record<string, Partial<Recommendation>>
  >({});
  const [createdRecs, setCreatedRecs] = useState<Recommendation[]>([]);
  const [messages, setMessages] = useState<PractitionerMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setOverrides(parsed.overrides ?? {});
        setCreatedRecs(parsed.createdRecs ?? []);
        setMessages(parsed.messages ?? []);
      }
    } catch {
      /* stockage indisponible : on repart de l'état mocké */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          overrides,
          createdRecs,
          messages,
        } satisfies PersistedState),
      );
    } catch {
      /* quota / mode privé : on ignore */
    }
  }, [overrides, createdRecs, messages, hydrated]);

  const recommendations = useMemo(() => {
    const applyOverrides = (rec: Recommendation) =>
      rec.id in overrides ? { ...rec, ...overrides[rec.id] } : rec;
    return [...createdRecs, ...SEED_RECS].map(applyOverrides);
  }, [overrides, createdRecs]);

  const sendMessage = useCallback((recId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        recommendationId: recId,
        author: "practitioner",
        text: trimmed,
        date: todayLabel(),
        read: false,
      },
    ]);
  }, []);

  const changeAutoRefill = useCallback(
    (recId: string, enabled: boolean, reason: string) => {
      setOverrides((prev) => ({
        ...prev,
        [recId]: { ...prev[recId], autoRefillEnabled: enabled },
      }));
      sendMessage(
        recId,
        `Renouvellement automatique ${enabled ? "activé" : "désactivé"} : ${reason.trim()}`,
      );
    },
    [sendMessage],
  );

  const changeComposition = useCallback(
    (recId: string, products: Product[], reason: string) => {
      const subtotal = products.reduce((sum, p) => sum + p.price, 0);
      const total = products.reduce(
        (sum, p) => sum + withDiscount(p.price, drDeBona.discountRate),
        0,
      );
      setOverrides((prev) => ({
        ...prev,
        [recId]: {
          ...prev[recId],
          products,
          subtotal: Math.round(subtotal * 100) / 100,
          total: Math.round(total * 100) / 100,
        },
      }));
      sendMessage(
        recId,
        `Composition mise à jour (${products.map((p) => p.name).join(", ")}) : ${reason.trim()}`,
      );
    },
    [sendMessage],
  );

  const createRecommendation = useCallback(
    (input: NewRecommendationInput): Recommendation => {
      const subtotal = input.products.reduce((sum, p) => sum + p.price, 0);
      const total = input.products.reduce(
        (sum, p) => sum + withDiscount(p.price, drDeBona.discountRate),
        0,
      );
      const rec: Recommendation = {
        id: `rec-praticien-${Date.now()}`,
        status: "NEW",
        statusLabel: "Non consultée",
        date: todayLabel(),
        practitioner: drDeBona,
        patient: input.patient,
        products: input.products,
        practitionerNote: input.practitionerNote,
        durationLabel: input.durationLabel,
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        autoRefillEnabled: input.autoRefillEnabled,
        plannedContainers: input.plannedContainers,
      };
      setCreatedRecs((prev) => [rec, ...prev]);
      return rec;
    },
    [],
  );

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages],
  );

  const markAllRead = useCallback(() => {
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
  }, []);

  const value = useMemo<RecommendationsContextValue>(
    () => ({
      recommendations,
      changeAutoRefill,
      changeComposition,
      createRecommendation,
      messages,
      sendMessage,
      unreadCount,
      markAllRead,
    }),
    [
      recommendations,
      changeAutoRefill,
      changeComposition,
      createRecommendation,
      messages,
      sendMessage,
      unreadCount,
      markAllRead,
    ],
  );

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
}

export function useRecommendations(): RecommendationsContextValue {
  const ctx = useContext(RecommendationsContext);
  if (!ctx)
    throw new Error(
      "useRecommendations doit être utilisé dans <RecommendationsProvider>",
    );
  return ctx;
}
