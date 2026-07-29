"use client";

import type { CalendarCell, DayMarkers } from "@/lib/calendar/calendarGrid";
import { getCategory } from "@/lib/constants/categories";

/** カレンダーの 1 日セル。予定はカテゴリー色ドット（最大3）、ToDo は小さな印。 */
export function CalendarDay({
  cell,
  selected,
  markers,
  onSelect,
  weekIndex,
  compact = false,
}: {
  cell: CalendarCell;
  selected: boolean;
  markers?: DayMarkers;
  onSelect: (dateKey: string) => void;
  /** 0=先頭列（日曜 or 月曜）。日曜/土曜の色付け用 */
  weekIndex: number;
  compact?: boolean;
}) {
  const dayNum = cell.date.getDate();
  const dots = markers?.eventCategories.slice(0, 3) ?? [];
  const hasTodo = markers?.hasTodo ?? false;

  // 曜日カラー（薄く）: 日曜=赤み, 土曜=青み。inMonth の時のみ。
  const weekendClass = "";

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.dateKey)}
      aria-label={`${cell.date.getMonth() + 1}月${dayNum}日${
        cell.isToday ? "（今日）" : ""
      }${dots.length || hasTodo ? "・予定あり" : ""}`}
      aria-pressed={selected}
      aria-current={cell.isToday ? "date" : undefined}
      className={`relative flex flex-col items-center justify-start rounded-xl transition ${
        compact ? "min-h-[40px] py-1" : "min-h-[52px] py-1.5"
      } ${selected ? "bg-primary text-primary-foreground" : "hover:bg-surface-muted"} ${weekendClass}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-sm tabular-nums ${
          cell.isToday && !selected
            ? "font-bold text-primary"
            : cell.inMonth
              ? selected
                ? "font-semibold"
                : "text-foreground"
              : "text-muted/40"
        }`}
      >
        {cell.isToday && !selected && (
          <span
            className="absolute h-6 w-6 rounded-full ring-2 ring-primary"
            aria-hidden
          />
        )}
        {dayNum}
      </span>

      {/* マーカー */}
      <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
        {dots.map((cat, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: selected ? "currentColor" : getCategory(cat as never).color,
            }}
            aria-hidden
          />
        ))}
        {hasTodo && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              selected ? "bg-white/80" : "bg-muted"
            }`}
            aria-hidden
          />
        )}
      </span>
    </button>
  );
}
