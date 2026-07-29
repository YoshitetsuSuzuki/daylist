import type { CalendarEvent, TodoItem } from "@/types";

let seq = 0;
export function resetSeq() {
  seq = 0;
}

export function makeTodo(partial: Partial<TodoItem> = {}): TodoItem {
  seq += 1;
  return {
    id: partial.id ?? `todo_${seq}`,
    title: partial.title ?? `やること${seq}`,
    dueDate: partial.dueDate,
    dueTime: partial.dueTime,
    memo: partial.memo,
    category: partial.category ?? "other",
    priority: partial.priority ?? "medium",
    isCompleted: partial.isCompleted ?? false,
    completedAt: partial.completedAt,
    eventId: partial.eventId,
    createdAt: partial.createdAt ?? "2026-07-01T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-07-01T00:00:00.000Z",
  };
}

export function makeEvent(partial: Partial<CalendarEvent> = {}): CalendarEvent {
  seq += 1;
  return {
    id: partial.id ?? `evt_${seq}`,
    title: partial.title ?? `予定${seq}`,
    date: partial.date ?? "2026-07-29",
    startTime: partial.startTime,
    endTime: partial.endTime,
    isAllDay: partial.isAllDay ?? false,
    memo: partial.memo,
    location: partial.location,
    category: partial.category ?? "other",
    priority: partial.priority ?? "medium",
    color: partial.color,
    linkedTodoId: partial.linkedTodoId,
    createdAt: partial.createdAt ?? "2026-07-01T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-07-01T00:00:00.000Z",
  };
}

/** テスト基準時刻: 2026-07-29(水) 12:00 ローカル */
export const NOW = new Date(2026, 6, 29, 12, 0, 0, 0);
