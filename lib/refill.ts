import type { Recommendation, RecommendationStatus } from "@/types/recommendation";

/**
 * Le statut interne (`rec.status`) est la source de vérité côté praticien. Côté patient, un
 * REFILL_DUE ne doit être visible que si le praticien a activé le renouvellement automatique
 * pour cette recommandation ; sinon la cure continue d'être affichée comme IN_PROGRESS (on
 * considère que le patient se réapprovisionne par ses propres moyens, à charge pour le
 * praticien de le relancer manuellement).
 */
export function getPatientView(rec: Recommendation): {
  status: RecommendationStatus;
  statusLabel: string;
} {
  if (rec.status === "REFILL_DUE" && !rec.autoRefillEnabled) {
    return { status: "IN_PROGRESS", statusLabel: "Cure en cours" };
  }
  return { status: rec.status, statusLabel: rec.statusLabel };
}

/** Vrai si le pot est épuisé mais que c'est au praticien de relancer le patient lui-même. */
export function needsManualAttention(rec: Recommendation): boolean {
  return rec.status === "REFILL_DUE" && !rec.autoRefillEnabled;
}

/** Vrai si le pot est épuisé et que le système a déjà alerté le patient automatiquement. */
export function isAutoRefillAlert(rec: Recommendation): boolean {
  return rec.status === "REFILL_DUE" && rec.autoRefillEnabled;
}

/** Texte de rappel standard, prêt à envoyer en un clic depuis l'espace praticien. */
export function defaultReminderText(rec: Recommendation): string {
  const productName = rec.products[0]?.name ?? "votre traitement";
  return `Bonjour, il serait temps de reprendre un pot de ${productName}. Contactez-moi si besoin.`;
}
