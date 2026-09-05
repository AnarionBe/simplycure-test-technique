import type {
  Patient,
  Practitioner,
  Product,
  Recommendation,
} from "@/types/recommendation";

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
 * Patientèle du Dr. De Bona, un praticien Tier 1 : volume important, suivi
 * individuel impossible à la main. `patientCamille` est le patient connecté
 * dans la "vue patient" de la démo ; les autres n'existent que pour peupler
 * le dashboard praticien et démontrer le tri par urgence.
 */
export const patientCamille: Patient = { id: "pat-camille", name: "Camille Laurent", initials: "CL" };
export const patientJulien: Patient = { id: "pat-julien", name: "Julien Roussel", initials: "JR" };
export const patientNora: Patient = { id: "pat-nora", name: "Nora Benali", initials: "NB" };
export const patientPaul: Patient = { id: "pat-paul", name: "Paul Meunier", initials: "PM" };
export const patientSophie: Patient = { id: "pat-sophie", name: "Sophie Imbert", initials: "SI" };
export const patientHugo: Patient = { id: "pat-hugo", name: "Hugo Castel", initials: "HC" };

/** Identifiant du patient connecté dans la "vue patient" de la démo. */
export const CURRENT_PATIENT_ID = patientCamille.id;

export const patients: Patient[] = [
  patientCamille,
  patientJulien,
  patientNora,
  patientPaul,
  patientSophie,
  patientHugo,
];

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
    patient: patientCamille,
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
    autoRefillEnabled: true,
    plannedContainers: 3,
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
    patient: patientCamille,
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
    autoRefillEnabled: true,
    plannedContainers: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 3 — REFILL_DUE : le cœur de la démo, réachat imminent
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-magnesium-refill",
    status: "REFILL_DUE",
    statusLabel: "À renouveler",
    date: "05/08/2026",
    practitioner: drDeBona,
    patient: patientCamille,
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
    autoRefillEnabled: true,
    plannedContainers: 3,
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 5 — REFILL_DUE en mode MANUEL : le pot arrive à épuisement
  // mais l'auto-refill est désactivé -> côté patient la carte reste
  // affichée comme une cure IN_PROGRESS classique (aucune alerte),
  // c'est au praticien de relancer le patient depuis son espace dédié.
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-ashwagandha-manuel",
    status: "REFILL_DUE",
    statusLabel: "À renouveler",
    date: "20/08/2026",
    practitioner: drDeBona,
    patient: patientCamille,
    practitionerNote:
      "Marco, on garde un œil ensemble sur l'ashwagandha avant de relancer un pot : je préfère qu'on refasse le point ensemble, donc pas de renouvellement automatique de mon côté.",
    durationLabel: "Suivi manuel par le praticien",
    products: [
      {
        id: "prod-ashwagandha-manuel",
        name: "Ashwagandha KSM-66",
        brand: "Ashwagandha KSM-66",
        price: 18.9,
        accent: "#7c3aed",
        posology: {
          dose: "2 gélules",
          frequency: "1x/jour le soir",
          label: "2 gélules 1x/jour le soir",
          containerLabel: "Pot de 60 gélules = 20 jours de traitement",
          daysPerContainer: 20,
        },
      },
    ],
    subtotal: 18.9,
    total: 16.07,
    refill: {
      authorizedRefills: 1,
      usedRefills: 0,
      currentRefillIndex: 1,
      daysUntilEmpty: 2,
      currentDay: 18,
      cycleDays: 20,
      alertLabel: "Fin de votre pot dans 2 jours (Jour 18/20)",
      authorizationLabel:
        "Suivi manuel : Dr. De Bona valide chaque renouvellement avant de le relancer",
    },
    autoRefillEnabled: false,
    plannedContainers: 2,
  },

  // ─────────────────────────────────────────────────────────────
  // CARTE 6 — COMPLETED : cure terminée, historique + rachat rapide
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-omega3-terminee",
    status: "COMPLETED",
    statusLabel: "Cure terminée",
    date: "02/05/2026",
    completedDate: "31/07/2026",
    practitioner: drDeBona,
    patient: patientCamille,
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
    autoRefillEnabled: true,
    plannedContainers: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // Patientèle additionnelle — peuple le dashboard praticien pour
  // démontrer le tri par urgence sur un praticien Tier 1.
  // ─────────────────────────────────────────────────────────────
  {
    id: "rec-probiotiques-julien",
    status: "REFILL_DUE",
    statusLabel: "À renouveler",
    date: "10/08/2026",
    practitioner: drDeBona,
    patient: patientJulien,
    practitionerNote:
      "Julien, on continue les probiotiques encore un cycle pour consolider le transit. Je préfère qu'on en reparle avant de relancer.",
    durationLabel: "Suivi manuel par le praticien",
    products: [
      {
        id: "prod-probiotiques-julien",
        name: "Probiotiques 20 Mds",
        brand: "Probiotiques 20 Mds",
        price: 22.5,
        accent: "#0e7490",
        posology: {
          dose: "1 gélule",
          frequency: "1x/jour à jeun",
          label: "1 gélule 1x/jour à jeun",
          containerLabel: "Pot de 30 gélules",
          daysPerContainer: 30,
        },
      },
    ],
    subtotal: 22.5,
    total: 19.13,
    refill: {
      authorizedRefills: 1,
      usedRefills: 0,
      currentRefillIndex: 1,
      daysUntilEmpty: 1,
      currentDay: 29,
      cycleDays: 30,
      alertLabel: "Fin de votre pot dans 1 jour (Jour 29/30)",
      authorizationLabel:
        "Suivi manuel : Dr. De Bona valide chaque renouvellement avant de le relancer",
    },
    autoRefillEnabled: false,
    plannedContainers: 1,
  },
  {
    id: "rec-omega3-nora",
    status: "REFILL_DUE",
    statusLabel: "À renouveler",
    date: "08/08/2026",
    practitioner: drDeBona,
    patient: patientNora,
    practitionerNote:
      "Nora, on refait le point sur le bilan lipidique avant de repartir sur un pot d'oméga-3, donc pas de renouvellement automatique pour l'instant.",
    durationLabel: "Suivi manuel par le praticien",
    products: [
      {
        id: "prod-omega3-nora",
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
    refill: {
      authorizedRefills: 1,
      usedRefills: 0,
      currentRefillIndex: 1,
      daysUntilEmpty: 4,
      currentDay: 86,
      cycleDays: 90,
      alertLabel: "Fin de votre pot dans 4 jours (Jour 86/90)",
      authorizationLabel:
        "Suivi manuel : Dr. De Bona valide chaque renouvellement avant de le relancer",
    },
    autoRefillEnabled: false,
    plannedContainers: 1,
  },
  {
    id: "rec-magnesium-paul",
    status: "REFILL_DUE",
    statusLabel: "À renouveler",
    date: "12/08/2026",
    practitioner: drDeBona,
    patient: patientPaul,
    practitionerNote:
      "Paul, on poursuit le magnésium sur la durée. J'ai autorisé le renouvellement automatique, tu n'as rien à faire de ton côté.",
    durationLabel: "Renouvellement autorisé x2",
    products: [
      {
        id: "prod-magnesium-paul",
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
      usedRefills: 1,
      currentRefillIndex: 2,
      daysUntilEmpty: 2,
      currentDay: 28,
      cycleDays: 30,
      alertLabel: "Fin de votre pot dans 2 jours (Jour 28/30)",
      authorizationLabel:
        "Dr. De Bona a autorisé 2 renouvellements (Refill 2/2 disponible)",
    },
    autoRefillEnabled: true,
    plannedContainers: 3,
  },
  {
    id: "rec-vitaminec-sophie",
    status: "NEW",
    statusLabel: "Non consultée",
    date: "04/09/2026",
    practitioner: drDeBona,
    patient: patientSophie,
    practitionerNote:
      "Bonjour Sophie, on démarre une cure de vitamine C liposomale pour la rentrée. À prendre sur 1 mois.",
    durationLabel: "À prendre sur 1 mois",
    products: [
      {
        id: "prod-vitaminec-sophie",
        name: "Vitamine C liposomale",
        brand: "Vitamine C liposomale",
        price: 19.9,
        accent: "#ea580c",
        posology: {
          dose: "1 sachet",
          frequency: "1x/jour le matin",
          label: "1 sachet 1x/jour le matin",
          containerLabel: "Boîte de 30 sachets",
          daysPerContainer: 30,
        },
      },
    ],
    subtotal: 19.9,
    total: 16.92,
    autoRefillEnabled: true,
    plannedContainers: 1,
  },
  {
    id: "rec-zinc-hugo",
    status: "IN_PROGRESS",
    statusLabel: "Cure démarrée",
    date: "20/08/2026",
    practitioner: drDeBona,
    patient: patientHugo,
    practitionerNote:
      "Hugo, cure de zinc pour soutenir l'immunité avant l'automne. On refait le point à la fin du pot.",
    durationLabel: "Cure de 60 jours",
    products: [
      {
        id: "prod-zinc-hugo",
        name: "Zinc bisglycinate",
        brand: "Zinc bisglycinate",
        price: 14.5,
        accent: "#4d7c0f",
        posology: {
          dose: "1 gélule",
          frequency: "1x/jour le soir",
          label: "1 gélule 1x/jour le soir",
          containerLabel: "Pot de 60 gélules",
          daysPerContainer: 60,
        },
      },
    ],
    subtotal: 14.5,
    total: 12.33,
    progress: {
      currentDay: 15,
      totalDays: 60,
      daysRemaining: 45,
    },
    autoRefillEnabled: true,
    plannedContainers: 1,
  },
];

/**
 * Petit catalogue produit (dédoublonné depuis les recommandations ci-dessus) utilisé par le
 * formulaire de création de recommandation côté praticien.
 */
export const productCatalog: Product[] = [
  recommendations[0].products[0], // Thyrostim®
  recommendations[0].products[1], // Magnésium bisglycinate
  recommendations[1].products[0], // Vitamine D3 K2-MK7
  recommendations[3].products[0], // Ashwagandha KSM-66
  recommendations[4].products[0], // Oméga-3 EPA/DHA
];
