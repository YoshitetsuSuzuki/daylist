"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

/** 検索入力。ラベルは視覚的に隠しつつ支援技術には提供。 */
export function SearchInput({
  value,
  onChange,
  placeholder = "検索",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        やることを検索
      </label>
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm outline-none focus:border-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="検索をクリア"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
