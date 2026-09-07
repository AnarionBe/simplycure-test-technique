import { Star } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-5">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <Logo className="h-5 w-auto text-forest-900" />
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Trustpilot</span>
          <span className="flex items-center gap-0.5 text-emerald-600">
            {Array.from({ length: 4 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <Star className="h-3.5 w-3.5 fill-current opacity-40" />
          </span>
          <span className="font-medium text-slate-700">4.4</span>
        </div>
      </div>
    </footer>
  );
}
