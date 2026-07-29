import type { CalendarEvent, TodoItem } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  toDateKey,
  isSameDay,
} from "@/lib/date/dateUtils";

export interface CalendarCell {
  /** "yyyy-MM-dd" */
  dateKey: string;
  date: Date;
  /** 表示中の月に属するか（前後月は薄く表示） */
  inMonth: boolean;
  isToday: boolean;
}

/**
 * 月間カレンダーのセル配列（週の並びにフラット化）を生成する。
 * weekStartsOn: 0=日曜始まり, 1=月曜始まり。
 * 前月・翌月の日付も週を埋めるために含める（inMonth=false）。
 */
export function buildMonthGrid(
  monthDate: Date,
  weekStartsOn: 0 | 1,
  today: Date = new Date(),
): CalendarCell[] {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const gridStart = startOfWeek(first, { weekStartsOn });
  const gridEnd = endOfWeek(last, { weekStartsOn });

  const cells: CalendarCell[] = [];
  let cursor = gridStart;
  // 最大 6 週（42 日）で必ず収まる
  while (cursor.getTime() <= gridEnd.getTime()) {
    cells.push({
      dateKey: toDateKey(cursor),
      date: cursor,
      inMonth: cursor.getMonth() === monthDate.getMonth(),
      isToday: isSameDay(cursor, today),
    });
    cursor = addDays(cursor, 1);
  }
  return cells;
}

/** 日付ごとのマーカー情報（ドット表示用） */
export interface DayMarkers {
  /** その日の予定に含まれるカテゴリー（最大3つに丸めるのは表示側） */
  eventCategories: string[];
  hasTodo: boolean;
}

/**
 * 指定期間の予定・ToDo から、日付キー → マーカーのマップを作る。
 * カレンダー全体を1回走査するだけで済むよう Map で返す。
 */
export function buildDayMarkers(
  events: CalendarEvent[],
  todos: TodoItem[],
): Map<string, DayMarkers> {
  const map = new Map<string, DayMarkers>();

  const ensure = (key: string): DayMarkers => {
    let m = map.get(key);
    if (!m) {
      m = { eventCategories: [], hasTodo: false };
      map.set(key, m);
    }
    return m;
  };

  for (const e of events) {
    const m = ensure(e.date);
    if (!m.eventCategories.includes(e.category)) {
      m.eventCategories.push(e.category);
    }
  }
  for (const t of todos) {
    if (!t.dueDate) continue;
    ensure(t.dueDate).hasTodo = true;
  }
  return map;
}

/** 指定日の予定を開始時刻順に返す（終日は先頭） */
export function eventsForDate(
  events: CalendarEvent[],
  dateKey: string,
): CalendarEvent[] {
  return events
    .filter((e) => e.date === dateKey)
    .sort((a, b) => {
      if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
      const ta = a.startTime ?? "99:99";
      const tb = b.startTime ?? "99:99";
      return ta.localeCompare(tb);
    });
}

/** 指定日に締切がある ToDo */
export function todosForDate(
  todos: TodoItem[],
  dateKey: string,
): TodoItem[] {
  return todos.filter((t) => t.dueDate === dateKey);
}
