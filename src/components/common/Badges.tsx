import type { Category, Priority, TodoItem } from "@/types";
import { getCategory } from "@/lib/constants/categories";
import { getPriority } from "@/lib/constants/priorities";
import { getDeadlineState, formatDeadlineLabel } from "@/lib/date/deadlineUtils";
import { AlertTriangle } from "lucide-react";

/** カテゴリーバッジ（アイコン＋ラベル、落ち着いた薄色） */
export function CategoryBadge({ category }: { category: Category }) {
  const c = getCategory(category);
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.softBg, color: c.softText }}
    >
      <Icon size={12} aria-hidden />
      {c.label}
    </span>
  );
}

/** 優先度バッジ。高でも強い赤は使わない。 */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = getPriority(priority);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: p.softBg, color: p.softText }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: p.dot }}
        aria-hidden
      />
      優先度{p.label}
    </span>
  );
}

/**
 * 締切バッジ。期限切れ/今日は色分けしつつ、テキストでも状態を明示（色だけに依存しない）。
 */
export function DeadlineBadge({
  todo,
  now,
}: {
  todo: TodoItem;
  now?: Date;
}) {
  const state = getDeadlineState(todo, now);
  const label = formatDeadlineLabel(todo, now);

  const styles: Record<string, string> = {
    overdue: "bg-danger-soft text-danger",
    today: "bg-primary-soft text-primary",
    tomorrow: "bg-surface-muted text-foreground",
    soon: "bg-surface-muted text-foreground",
    future: "bg-surface-muted text-muted",
    none: "bg-surface-muted text-muted",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[state]}`}
    >
      {state === "overdue" && <AlertTriangle size={12} aria-hidden />}
      {label}
    </span>
  );
}
