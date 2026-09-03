import type { Practitioner, Recommendation } from "@/types/recommendation";

/**
 * Praticien prescripteur de la démo.
 * L'avantage praticien (-15%) est appliqué automatiquement au réachat.
 */
export const drDeBona: Practitioner = {
  id: "prac-de-bona",
  name: "Dr. Marco De Bona",
  title: "Médecin nutritionniste",
  initials: "MD",
  discountLabel: "-15%",
  discountRate: 0.15,
};

/**
 * 3 recommandations couvrant les 3 états du cycle de vie.
 * Contexte temporel : nous sommes le 03/09/2026.
 *
 * Les totaux `total` sont déjà nets de l'avantage praticien -15% :
 *   Carte 1 : 37,32 € -> 31,72 €
 *   Carte 2 : 24,90 € -> 21,17 €
 *   Carte 3 : 10,12 € ->  8,60 €
 */
export const recommendations: Recommendation[] = [
  // ─────────────────────────────────────────────────────────────
  // CARTE 1 — NEW : nouvelle recommandation, jamais consultée
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-thyrostim",
    status: "NEW",
    statusLabel: "Non consultée",
    date: "03/09/2026",
    practitioner: drDeBona,
    practitionerNote:
      "Bonjour Marco, voici ma recommandation de compléments alimentaires. À prendre sur 3 mois.",
    durationLabel: "À prendre sur 3 mois",
    products: [
      {
        id: "prod-thyrostim",
        name: "Thyrostim®",
        brand: "Thyrostim®",
        price: 27.2,
        accent: "#0f382c",
        posology: {
          dose: "2 gélules",
          frequency: "1x/jour le matin",
          label: "2 gélules 1x/jour le matin",
          containerLabel: "Pot de 60 gélules",
          daysPerContainer: 30,
        },
      },
      {
        id: "prod-magnesium-thyro",
        name: "Magnésium bisglycinate",
        brand: "Magnésium bisglycinate",
        price: 10.12,
        accent: "#1f5c48",
        posology: {
          dose: "2 gélules",
          frequency: "1x/jour le soir",
          label: "2 gélules 1x/jour le soir",
          containerLabel: "Pot de 60 gélules",
          daysPerContainer: 30,
        },
      },
    ],
    subtotal: 37.32,
    total: 31.72,
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 2 — IN_PROGRESS : cure démarrée, on suit la progression
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-vitamine-d3",
    status: "IN_PROGRESS",
    statusLabel: "Cure démarrée",
    date: "15/08/2026",
    practitioner: drDeBona,
    practitionerNote:
      "Marco, on installe une cure de fond pour l'hiver. 3 gouttes chaque matin pendant 90 jours, on refait le point en visio à la fin du pot.",
    durationLabel: "Cure de 90 jours",
    products: [
      {
        id: "prod-vitamine-d3-k2",
        name: "Vitamine D3 K2-MK7",
        brand: "Vitamine D3 K2-MK7",
        price: 24.9,
        accent: "#2563eb",
        posology: {
          dose: "3 gouttes",
          frequency: "1x/jour",
          label: "3 gouttes 1x/jour",
          containerLabel: "Flacon de 20 ml",
          daysPerContainer: 90,
        },
      },
    ],
    subtotal: 24.9,
    total: 21.17,
    progress: {
      currentDay: 20,
      totalDays: 90,
      daysRemaining: 70,
    },
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 3 — REFILL_DUE : le cœur de la démo, réachat imminent
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-magnesium-refill",
    status: "REFILL_DUE",
    statusLabel: "Renouvellement requis",
    date: "05/08/2026",
    practitioner: drDeBona,
    practitionerNote:
      "Marco, on poursuit le magnésium le temps de stabiliser le sommeil. J'ai autorisé 2 renouvellements automatiques : tu n'auras qu'à valider quand le pot approche de la fin.",
    durationLabel: "Renouvellement autorisé x2",
    products: [
      {
        id: "prod-magnesium-refill",
        name: "Magnésium bisglycinate",
        brand: "Magnésium bisglycinate",
        price: 10.12,
        accent: "#b45309",
        posology: {
          dose: "4 gélules",
          frequency: "1x/jour",
          label: "4 gélules 1x/jour",
          containerLabel: "Pot de 60 gélules = 15 jours de traitement",
          daysPerContainer: 15,
        },
      },
    ],
    subtotal: 10.12,
    total: 8.6,
    refill: {
      authorizedRefills: 2,
      usedRefills: 0,
      currentRefillIndex: 1,
      daysUntilEmpty: 3,
      currentDay: 27,
      cycleDays: 30,
      alertLabel: "Fin de votre pot dans 3 jours (Jour 27/30)",
      authorizationLabel:
        "Dr. De Bona a autorisé 2 renouvellements (Refill 1/2 disponible)",
    },
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 4 — COMPLETED : cure terminée, historique + rachat rapide
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-omega3-terminee",
    status: "COMPLETED",
    statusLabel: "Cure terminée",
    date: "02/05/2026",
    completedDate: "31/07/2026",
    practitioner: drDeBona,
    practitionerNote:
      "Marco, cure d'oméga-3 bouclée sur 90 jours. Bilan lipidique à refaire ; si tu veux poursuivre en entretien, tu peux relancer le même protocole quand tu le souhaites.",
    durationLabel: "Cure de 90 jours menée à terme",
    products: [
      {
        id: "prod-omega3-epa-dha",
        name: "Oméga-3 EPA/DHA",
        brand: "Oméga-3 EPA/DHA",
        price: 32.0,
        accent: "#475569",
        posology: {
          dose: "2 capsules",
          frequency: "1x/jour au repas",
          label: "2 capsules 1x/jour au repas",
          containerLabel: "Pot de 180 capsules",
          daysPerContainer: 90,
        },
      },
    ],
    subtotal: 32.0,
    total: 27.2,
    progress: {
      currentDay: 90,
      totalDays: 90,
      daysRemaining: 0,
    },
  },
];
