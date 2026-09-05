/**
 * Modèle de données du "Cockpit de suivi de cure" Simplycure.
 *
 * Chaque recommandation d'un praticien suit un cycle de vie en 3 états :
 *  - NEW          : la reco vient d'arriver, jamais consultée par le patient.
 *  - IN_PROGRESS  : la cure a démarré, on suit la progression du pot.
 *  - REFILL_DUE   : le pot arrive à épuisement -> déclencher le réachat (Refill 1-Clic).
 *  - COMPLETED    : la cure est allée à son terme -> historique + rachat rapide.
 */

export type RecommendationStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "REFILL_DUE"
  | "COMPLETED";

/** État local d'une carte vis-à-vis du panier (piloté par la page). */
export type CartState = "idle" | "added";

export interface Practitioner {
  id: string;
  /** "Dr. Marco De Bona" */
  name: string;
  /** "Médecin nutritionniste" */
  title: string;
  /** Initiales affichées dans l'avatar : "MD" */
  initials: string;
  /** Libellé de l'avantage praticien : "-15%" */
  discountLabel: string;
  /** Taux de remise appliqué : 0.15 */
  discountRate: number;
}

export interface Posology {
  /** "4 gélules" */
  dose: string;
  /** "1x/jour" */
  frequency: string;
  /** Texte prêt à afficher : "4 gélules 1x/jour" */
  label: string;
  /** "Pot de 60 gélules" */
  containerLabel?: string;
  /** Nombre de jours de traitement couverts par un contenant */
  daysPerContainer?: number;
}

export interface Product {
  id: string;
  /** "Magnésium bisglycinate" */
  name: string;
  /** Marque / gamme, ex. "Thyrostim®" */
  brand?: string;
  /** Prix public unitaire en euros (avant avantage praticien) */
  price: number;
  /** Couleur d'accent pour la vignette produit (placeholder visuel) */
  accent: string;
  posology?: Posology;
}

/** Suivi de progression d'une cure en cours. */
export interface CureProgress {
  /** Jour courant de la cure : 20 */
  currentDay: number;
  /** Durée totale de la cure en jours : 90 */
  totalDays: number;
  /** Jours restants avant la fin du pot : 70 */
  daysRemaining: number;
}

/** Informations de renouvellement pour une carte REFILL_DUE. */
export interface RefillInfo {
  /** Nombre de renouvellements autorisés par le praticien : 2 */
  authorizedRefills: number;
  /** Nombre de renouvellements déjà consommés : 0 */
  usedRefills: number;
  /** Index du refill actuellement disponible (1 => "Refill 1/2") */
  currentRefillIndex: number;
  /** Jours restants avant épuisement du pot : 3 */
  daysUntilEmpty: number;
  /** Jour courant dans le cycle : 27 */
  currentDay: number;
  /** Durée du cycle en jours : 30 */
  cycleDays: number;
  /** Alerte prête à afficher : "Fin de votre pot dans 3 jours (Jour 27/30)" */
  alertLabel: string;
  /** Autorisation prête à afficher */
  authorizationLabel: string;
}

export interface Recommendation {
  id: string;
  status: RecommendationStatus;
  /** Libellé métier du statut : "Non consultée", "Cure démarrée", "Renouvellement requis" */
  statusLabel: string;
  /** Date d'émission : "03/09/2026" */
  date: string;
  practitioner: Practitioner;
  products: Product[];
  /** Mot du praticien affiché dans la modale de détail */
  practitionerNote: string;
  /** Consigne de durée éventuelle : "À prendre sur 3 mois" */
  durationLabel?: string;
  /** Date de fin de cure (uniquement pour COMPLETED) : "31/07/2026" */
  completedDate?: string;
  /** Somme des prix publics des produits */
  subtotal: number;
  /** Total après avantage praticien */
  total: number;
  /** Progression (uniquement pour IN_PROGRESS) */
  progress?: CureProgress;
  /** Infos de renouvellement (uniquement pour REFILL_DUE) */
  refill?: RefillInfo;
  /**
   * Réglage praticien décidé à la création (modifiable ensuite) : si vrai, le passage en
   * REFILL_DUE est visible et actionnable côté patient (Refill 1-Clic + notification
   * automatique). Si faux, le praticien garde la main : le patient continue de voir sa cure
   * comme IN_PROGRESS, à charge pour le praticien de le recontacter manuellement.
   */
  autoRefillEnabled: boolean;
  /** Nombre total de boîtes prévues pour la cure, commandées une par une (1ère boîte incluse). */
  plannedContainers: number;
}

/** Message échangé autour d'une recommandation (mocké : pas de vrai mail envoyé). */
export interface PractitionerMessage {
  id: string;
  recommendationId: string;
  /** "practitioner" = envoyé manuellement par le praticien, "system" = déclenché par un refill auto */
  author: "practitioner" | "system";
  text: string;
  /** Date prête à afficher : "05/09/2026" */
  date: string;
  read: boolean;
}

export interface CartLine {
  productId: string;
  name: string;
  /** Prix unitaire après avantage praticien */
  unitPrice: number;
  quantity: number;
  recommendationId: string;
  practitionerName: string;
}

/** Filtres du cockpit (chips au-dessus de la liste). */
export type RecommendationFilter =
  | "ALL"
  | "NEW"
  | "IN_PROGRESS"
  | "REFILL_DUE"
  | "COMPLETED";

/** Onglets de navigation du header. */
export type NavTab = "catalogue" | "commandes" | "recommandations";
