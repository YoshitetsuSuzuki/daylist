"use client";

import type { TodoItem } from "@/types";
import { TodoCheckbox } from "@/components/common/TodoCheckbox";
import {
  CategoryBadge,
  PriorityBadge,
  DeadlineBadge,
} from "@/components/common/Badges";
import { CalendarClock, StickyNote, Image as ImageIcon } from "lucide-react";

/**
 * やること 1 件のカード。
 * タップで編集を開く。完了済みは淡く表示。
 */
export function TodoCard({
  todo,
  onToggle,
  onOpen,
  showEventLink = true,
  now,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onOpen: () => void;
  showEventLink?: boolean;
  now?: Date;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-2xl border border-border bg-surface px-2 py-1.5 shadow-card transition ${
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
        className="flex min-w-0 flex-1 flex-col gap-1 py-1.5 pr-2 text-left"
        aria-label={`${todo.title} を編集`}
      >
        <span
          className={`truncate text-sm font-semibold ${
            todo.isCompleted ? "text-muted line-through" : "text-foreground"
          }`}
        >
          {todo.title}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          <DeadlineBadge todo={todo} now={now} />
          <CategoryBadge category={todo.category} />
          {todo.priority === "high" && <PriorityBadge priority={todo.priority} />}
          {showEventLink && todo.eventId && (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted"
              aria-label="予定に紐づいています"
            >
              <CalendarClock size={13} aria-hidden />
              予定
            </span>
          )}
          {todo.memo && (
            <span aria-label="メモあり" title="メモあり">
              <StickyNote size={13} className="text-muted" aria-hidden />
            </span>
          )}
          {todo.photos && todo.photos.length > 0 && (
            <span aria-label="写真あり" title="写真あり">
              <ImageIcon size={13} className="text-muted" aria-hidden />
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
