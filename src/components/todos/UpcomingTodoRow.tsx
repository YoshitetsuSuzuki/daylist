"use client";

import type { TodoItem } from "@/types";
import { TodoCheckbox } from "@/components/common/TodoCheckbox";
import {
  parseDateKey,
  formatJpShortDate,
  todayKey,
  addDays,
  toDateKey,
} from "@/lib/date/dateUtils";
import { getCategory } from "@/lib/constants/categories";

/**
 * ホーム「近日のやること」用の 1 行（箇条書き）。
 * 「日付・時間・やること」の順に並べる。締切の近い今日〜2週間先を想定。
 */
export function UpcomingTodoRow({
  todo,
  onToggle,
  onOpen,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const due = todo.dueDate ? parseDateKey(todo.dueDate) : null;
  const dateLabel = due ? formatJpShortDate(due) : "日付なし";

  const today = todayKey();
  const tomorrow = toDateKey(addDays(new Date(), 1));
  const isToday = todo.dueDate === today;
  const isTomorrow = todo.dueDate === tomorrow;

  const cat = getCategory(todo.category);

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-border bg-surface px-2 py-1 shadow-card ${
        todo.isCompleted ? "opacity-60" : ""
      }`}
    >
      <TodoCheckbox
        checked={todo.isCompleted}
        onChange={onToggle}
        label={todo.title}
      />
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-1 text-left"
        aria-label={`${todo.title} を編集`}
      >
        {/* 日付 */}
        <span
          className={`w-14 shrink-0 text-xs font-semibold tabular-nums ${
            isToday ? "text-primary" : "text-muted"
          }`}
        >
          {isToday ? "今日" : isTomorrow ? "明日" : dateLabel}
        </span>
        {/* 時間 */}
        <span className="w-11 shrink-0 text-xs tabular-nums text-muted">
          {todo.dueTime ?? ""}
        </span>
        {/* やること */}
        <span
          className={`flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium ${
            todo.isCompleted ? "text-muted line-through" : "text-foreground"
          }`}
        >
          <span
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: cat.color }}
            aria-hidden
          />
          <span className="truncate">{todo.title}</span>
        </span>
      </button>
    </div>
  );
}
