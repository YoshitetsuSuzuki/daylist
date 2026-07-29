"use client";

import { useToast } from "@/context/ToastContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const tone = {
  success: "text-success",
  error: "text-danger",
  info: "text-primary",
};

/** 画面下部（ボトムナビの上）に控えめに表示するトースト群。 */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+var(--safe-bottom))] z-[70] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-center gap-2 rounded-xl bg-foreground/95 px-4 py-3 text-sm font-medium text-white shadow-pop"
          >
            <Icon size={18} className={tone[t.kind]} aria-hidden />
            <span className="text-left">{t.message}</span>
          </button>
        );
      })}
    </div>
  );
}
