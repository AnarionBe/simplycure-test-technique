"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export interface ToastData {
  id: number;
  message: string;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
  /** Durée d'affichage en ms avant auto-fermeture */
  duration?: number;
}

export default function Toast({
  toast,
  onDismiss,
  duration = 4200,
}: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-forest-700/30 bg-forest-900 px-4 py-3.5 text-white shadow-xl shadow-forest-900/25"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              onClick={onDismiss}
              aria-label="Fermer la notification"
              className="-mr-1 -mt-0.5 rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
