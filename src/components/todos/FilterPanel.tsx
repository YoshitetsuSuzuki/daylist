"use client";

import type { Category, Priority } from "@/types";
import { CATEGORIES } from "@/lib/constants/categories";
import { PRIORITIES } from "@/lib/constants/priorities";

export interface TodoFilter {
  category: Category | "all";
  priority: Priority | "all";
  /** all=すべて, linked=予定に紐づく, standalone=単独 */
  link: "all" | "linked" | "standalone";
  /** all / overdue / today / week / none */
  deadline: "all" | "overdue" | "today" | "week" | "none";
}

export const DEFAULT_FILTER: TodoFilter = {
  category: "all",
  priority: "all",
  link: "all",
  deadline: "all",
};

export function isFilterActive(f: TodoFilter): boolean {
  return (
    f.category !== "all" ||
    f.priority !== "all" ||
    f.link !== "all" ||
    f.deadline !== "all"
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[36px] rounded-full border px-3 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-surface text-foreground hover:bg-surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterPanel({
  filter,
  onChange,
  onReset,
}: {
  filter: TodoFilter;
  onChange: (f: TodoFilter) => void;
  onReset: () => void;
}) {
  return (
    <div className="animate-slide-up space-y-3 rounded-2xl border border-border bg-surface p-3">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">カテゴリー</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filter.category === "all"}
            onClick={() => onChange({ ...filter, category: "all" })}
          >
            すべて
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              active={filter.category === c.key}
              onClick={() => onChange({ ...filter, category: c.key })}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">優先度</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={filter.priority === "all"}
            onClick={() => onChange({ ...filter, priority: "all" })}
          >
            すべて
          </Chip>
          {PRIORITIES.map((p) => (
            <Chip
              key={p.key}
              active={filter.priority === p.key}
              onClick={() => onChange({ ...filter, priority: p.key })}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">締切</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", "すべて"],
            ["overdue", "期限切れ"],
            ["today", "今日"],
            ["week", "7日以内"],
            ["none", "締切なし"],
          ].map(([key, label]) => (
            <Chip
              key={key}
              active={filter.deadline === key}
              onClick={() =>
                onChange({ ...filter, deadline: key as TodoFilter["deadline"] })
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-muted">予定との紐付け</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", "すべて"],
            ["linked", "予定に紐づく"],
            ["standalone", "単独"],
          ].map(([key, label]) => (
            <Chip
              key={key}
              active={filter.link === key}
              onClick={() =>
                onChange({ ...filter, link: key as TodoFilter["link"] })
              }
            >
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-primary hover:underline"
        >
          絞り込みをリセット
        </button>
      </div>
    </div>
  );
}
