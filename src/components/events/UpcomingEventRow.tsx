"use client";

import type { CalendarEvent } from "@/types";
import {
  parseDateKey,
  formatJpShortDate,
  todayKey,
  addDays,
  toDateKey,
} from "@/lib/date/dateUtils";
import { getCategory } from "@/lib/constants/categories";
import { CalendarClock, MapPin } from "lucide-react";

/**
 * ホーム「近日の予定」用の 1 行（箇条書き）。
 * 「日付・時間・予定」の順。やること行と同じ体裁だが、完了チェックの代わりに
 * カレンダーの印を置き、タップで予定編集を開く。
 */
export function UpcomingEventRow({
  event,
  onOpen,
}: {
  event: CalendarEvent;
  onOpen: () => void;
}) {
  const d = parseDateKey(event.date);
  const dateLabel = d ? formatJpShortDate(d) : event.date;

  const today = todayKey();
  const tomorrow = toDateKey(addDays(new Date(), 1));
  const isToday = event.date === today;
  const isTomorrow = event.date === tomorrow;

  const cat = getCategory(event.category);
  const accent = event.color || cat.color;

  const timeLabel = event.isAllDay ? "終日" : (event.startTime ?? "");

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`予定「${event.title}」を編集`}
      className="flex w-full items-center gap-1 rounded-xl border border-border bg-surface px-2 py-1 text-left shadow-card"
    >
      {/* 予定を示す印（チェックボックスと同じ幅で行を揃える） */}
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center"
        aria-hidden
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}22`, color: accent }}
        >
          <CalendarClock size={14} />
        </span>
      </span>
      <span className="flex min-w-0 flex-1 items-start gap-2 py-1.5 pr-1">
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
          {timeLabel}
        </span>
        {/* 予定名（＋場所があれば表示） */}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            <span className="truncate">{event.title}</span>
          </span>
          {event.location && (
            <span className="flex items-center gap-1 pl-3 text-xs text-muted">
              <MapPin size={11} className="shrink-0" aria-hidden />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
