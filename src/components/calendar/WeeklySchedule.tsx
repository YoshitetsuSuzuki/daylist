"use client";

import type { CalendarEvent } from "@/types";
import {
  parseDateKey,
  startOfWeek,
  addDays,
  toDateKey,
  isSameDay,
  formatJpShortDate,
} from "@/lib/date/dateUtils";
import { eventsForDate } from "@/lib/calendar/calendarGrid";
import { getCategory } from "@/lib/constants/categories";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 週間予定表。表示中の週の 7 日を縦に並べ、各日の予定を開始〜終了つきで表示。
 * 日ごとの ＋ でその日に予定を追加、予定タップで編集。
 */
export function WeeklySchedule({
  anchorKey,
  events,
  weekStartsOn,
  today,
  onPrevWeek,
  onNextWeek,
  onToday,
  onAddDay,
  onOpenEvent,
}: {
  anchorKey: string;
  events: CalendarEvent[];
  weekStartsOn: 0 | 1;
  today: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onAddDay: (dateKey: string) => void;
  onOpenEvent: (e: CalendarEvent) => void;
}) {
  const anchor = parseDateKey(anchorKey) ?? today;
  const start = startOfWeek(anchor, { weekStartsOn });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const rangeLabel = `${formatJpShortDate(days[0])}〜${formatJpShortDate(days[6])}`;

  return (
    <div className="rounded-2xl bg-surface p-3 shadow-card">
      <div className="mb-1 flex items-center justify-between px-1">
        <h2 className="text-base font-bold">{rangeLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="前の週へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
          >
            今週
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            aria-label="次の週へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {days.map((d) => {
          const key = toDateKey(d);
          const wi = d.getDay();
          const isToday = isSameDay(d, today);
          const list = eventsForDate(events, key);
          return (
            <div key={key} className="flex items-start gap-2 py-2">
              {/* 曜日＋日付 */}
              <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
                <span
                  className={`text-[11px] font-medium ${
                    wi === 0
                      ? "text-danger/70"
                      : wi === 6
                        ? "text-primary/70"
                        : "text-muted"
                  }`}
                >
                  {WEEKDAYS[wi]}
                </span>
                <span
                  className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>

              {/* その日の予定 */}
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                {list.length === 0 ? (
                  <span className="py-1 text-xs text-muted">予定なし</span>
                ) : (
                  list.map((e) => {
                    const accent = e.color || getCategory(e.category).color;
                    const t = e.isAllDay
                      ? "終日"
                      : [e.startTime, e.endTime].filter(Boolean).join("〜");
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onOpenEvent(e)}
                        aria-label={`予定「${e.title}」を編集`}
                        className="flex w-full min-w-0 items-center gap-1.5 rounded-lg bg-surface-muted/60 px-2 py-1 text-left"
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        {t && (
                          <span className="shrink-0 text-[11px] tabular-nums text-muted">
                            {t}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                          {e.title}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* その日に追加 */}
              <button
                type="button"
                onClick={() => onAddDay(key)}
                aria-label={`${d.getMonth() + 1}月${d.getDate()}日に予定を追加`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-primary-soft hover:text-primary"
              >
                <Plus size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
