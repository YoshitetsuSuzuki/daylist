"use client";

import { useId, type ReactNode } from "react";
import type { Category, Priority } from "@/types";
import { CATEGORIES } from "@/lib/constants/categories";
import { PRIORITIES } from "@/lib/constants/priorities";

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "h-11 w-full rounded-xl border bg-surface px-3 text-sm outline-none focus:border-primary";

export function TextInput({
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...rest}
      className={`${inputBase} ${error ? "border-danger" : "border-border"}`}
    />
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}

/** ON/OFF スイッチ */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/** カテゴリー選択（チップ） */
export function CategoryPicker({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="カテゴリー">
      {CATEGORIES.map((c) => {
        const Icon = c.icon;
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.key)}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition ${
              active
                ? "border-transparent text-white"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
            style={active ? { backgroundColor: c.color } : undefined}
          >
            <Icon size={14} aria-hidden />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

/** 優先度選択（セグメント） */
export function PriorityPicker({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="radiogroup"
      aria-label="優先度"
    >
      {PRIORITIES.map((p) => {
        const active = p.key === value;
        return (
          <button
            key={p.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.key)}
            className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border text-sm font-medium transition ${
              active
                ? "border-transparent"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
            style={
              active ? { backgroundColor: p.softBg, color: p.softText } : undefined
            }
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.dot }}
              aria-hidden
            />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
