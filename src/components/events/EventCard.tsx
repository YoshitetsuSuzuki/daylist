"use client";

import type { CalendarEvent } from "@/types";
import { CategoryBadge } from "@/components/common/Badges";
import { getCategory } from "@/lib/constants/categories";
import { MapPin, CheckSquare, StickyNote } from "lucide-react";

/**
 * 予定 1 件のカード。左端にカテゴリー色（または指定色）のバー。
 * ToDo 紐付けの有無・完了状態も表示。
 */
export function EventCard({
  event,
  onOpen,
  linkedCompleted,
}: {
  event: CalendarEvent;
  onOpen: () => void;
  /** 紐づく ToDo の完了状態（あれば） */
  linkedCompleted?: boolean;
}) {
  const accent = event.color || getCategory(event.category).color;
  const timeLabel = event.isAllDay
    ? "終日"
    : [event.startTime, event.endTime].filter(Boolean).join(" 〜 ") || "時刻未設定";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-stretch gap-3 rounded-2xl border border-border bg-surface p-3 text-left shadow-card transition hover:bg-surface-muted/40"
      aria-label={`${event.title} を編集`}
    >
      <span
        className="w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tabular-nums text-muted">
            {timeLabel}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {event.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={event.category} />
          {event.location && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <MapPin size={12} aria-hidden />
              {event.location}
            </span>
          )}
          {event.linkedTodoId && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <CheckSquare size={12} aria-hidden />
              {linkedCompleted ? "やること完了" : "やること"}
            </span>
          )}
          {event.memo && (
            <span aria-label="メモあり" title="メモあり">
              <StickyNote size={12} className="text-muted" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
