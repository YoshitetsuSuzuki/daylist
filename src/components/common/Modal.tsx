"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** モバイルでボトムシート風に下寄せするか */
  sheetOnMobile?: boolean;
  /** ヘッダー右に置く要素（保存ボタン等） */
  footer?: ReactNode;
  labelledBy?: string;
}

/**
 * アクセシブルなモーダル。
 * - Escape で閉じる
 * - フォーカストラップ（Tab が内側を循環）
 * - 開いたら最初のフォーカス、閉じたら元の要素へ戻す
 * - aria-modal / role=dialog
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  sheetOnMobile = true,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // 最初のフォーカスを内側へ
    const t = setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 30);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          sheetOnMobile
            ? "mt-auto flex max-h-[92vh] flex-col sm:m-auto sm:max-h-[88vh] sm:w-full sm:max-w-lg"
            : "m-auto flex max-h-[88vh] w-full max-w-lg flex-col"
        }
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-surface shadow-pop ${
            sheetOnMobile
              ? "animate-slide-up rounded-t-2xl sm:rounded-2xl"
              : "animate-slide-up rounded-2xl"
          }`}
        >
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <h2 id={titleId} className="text-base font-bold">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              {footer}
              <button
                type="button"
                onClick={onClose}
                aria-label="閉じる"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
