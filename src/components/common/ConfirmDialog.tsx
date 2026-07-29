"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export interface ConfirmChoice {
  label: string;
  onSelect: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface Props {
  open: boolean;
  title: string;
  message?: ReactNode;
  /** 複数選択肢（予定削除の3択などに対応） */
  choices: ConfirmChoice[];
  onCancel: () => void;
  cancelLabel?: string;
}

/** 確認ダイアログ。フォーカスをキャンセルに当て、Escape で閉じる。 */
export function ConfirmDialog({
  open,
  title,
  message,
  choices,
  onCancel,
  cancelLabel = "キャンセル",
}: Props) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => cancelRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
      prev?.focus?.();
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex animate-fade-in items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm animate-slide-up rounded-2xl bg-surface p-5 shadow-pop"
      >
        <h2 id={titleId} className="text-base font-bold">
          {title}
        </h2>
        {message && (
          <div className="mt-2 text-sm text-muted">{message}</div>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {choices.map((c, i) => (
            <Button
              key={i}
              variant={c.variant ?? "primary"}
              onClick={c.onSelect}
              className="w-full"
            >
              {c.label}
            </Button>
          ))}
          <Button
            ref={cancelRef}
            variant="ghost"
            onClick={onCancel}
            className="w-full"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
