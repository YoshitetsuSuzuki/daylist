"use client";

import { useMemo } from "react";
import type { CalendarEvent, TodoItem } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthGrid,
  buildDayMarkers,
} from "@/lib/calendar/calendarGrid";
import {
  parseDateKey,
  addMonths,
  toDateKey,
  formatJpYearMonth,
  weekdayLabels,
} from "@/lib/date/dateUtils";
import { CalendarDay } from "./CalendarDay";

interface Props {
  /** "yyyy-MM" */
  viewMonth: string;
  /** "yyyy-MM-dd" */
  selectedDate: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  weekStartsOn: 0 | 1;
  onSelectDate: (dateKey: string) => void;
  onChangeMonth: (monthKey: string) => void;
  compact?: boolean;
}

export function MonthlyCalendar({
  viewMonth,
  selectedDate,
  events,
  todos,
  weekStartsOn,
  onSelectDate,
  onChangeMonth,
  compact = false,
}: Props) {
  // viewMonth("yyyy-MM") からその月の 1 日の Date を作る
  const monthDate = useMemo(() => {
    const d = parseDateKey(`${viewMonth}-01`);
    return d ?? new Date();
  }, [viewMonth]);

  const cells = useMemo(
    () => buildMonthGrid(monthDate, weekStartsOn),
    [monthDate, weekStartsOn],
  );

  const markers = useMemo(
    () => buildDayMarkers(events, todos),
    [events, todos],
  );

  const labels = weekdayLabels(weekStartsOn);

  const shiftMonth = (delta: number) => {
    const next = addMonths(monthDate, delta);
    onChangeMonth(toDateKey(next).slice(0, 7));
  };

  const goToday = () => {
    const today = new Date();
    onChangeMonth(toDateKey(today).slice(0, 7));
    onSelectDate(toDateKey(today));
  };

  return (
    <div className={compact ? "" : "rounded-2xl bg-surface p-3 shadow-card"}>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-base font-bold">{formatJpYearMonth(monthDate)}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="前の月へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
          >
            今日
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="次の月へ"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {labels.map((label, i) => (
          <div
            key={label}
            className={`pb-1 text-center text-xs font-semibold ${
              (weekStartsOn === 0 && i === 0) || (weekStartsOn === 1 && i === 6)
                ? "text-danger/70"
                : (weekStartsOn === 0 && i === 6) ||
                    (weekStartsOn === 1 && i === 5)
                  ? "text-primary/70"
                  : "text-muted"
            }`}
            aria-hidden
          >
            {label}
          </div>
        ))}
        {cells.map((cell, i) => (
          <CalendarDay
            key={cell.dateKey}
            cell={cell}
            selected={cell.dateKey === selectedDate}
            markers={markers.get(cell.dateKey)}
            onSelect={onSelectDate}
            weekIndex={i % 7}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
