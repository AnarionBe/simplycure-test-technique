import { Star } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-5">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-forest-900" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2c1.5 4 5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 3.5-5 5-9Z"
            />
            <path
              fill="currentColor"
              d="M12 13c-1 2.6-3.4 3.6-3.4 6A3.4 3.4 0 0 0 12 22a3.4 3.4 0 0 0 3.4-3c0-2.4-2.4-3.4-3.4-6Z"
            />
          </svg>
          <span className="font-serif text-base font-semibold text-forest-900">
            Simplycure
          </span>
        </div>
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
