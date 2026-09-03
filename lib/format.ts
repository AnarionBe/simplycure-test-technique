/** Formate un montant en euros à la française : 8.6 -> "8,60 €" */
export function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/** Applique l'avantage praticien à un prix unitaire. */
export function withDiscount(price: number, rate: number): number {
  return Math.round(price * (1 - rate) * 100) / 100;
}

/** "Dr. Marco De Bona" -> "Dr. De Bona" */
export function shortDoctor(fullName: string): string {
  return `Dr. ${fullName.split(" ").slice(-2).join(" ")}`;
}
