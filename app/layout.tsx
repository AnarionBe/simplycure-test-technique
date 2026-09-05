import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { RecommendationsProvider } from "@/lib/recommendations";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simplycure — Cockpit de suivi de cure",
  description:
    "Prototype case study : transformer l'onglet Recommandations en cockpit de suivi de cure avec Refill 1-Clic.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f9fafb] text-slate-900">
        <RecommendationsProvider>
          <CartProvider>{children}</CartProvider>
        </RecommendationsProvider>
      </body>
    </html>
  );
}
