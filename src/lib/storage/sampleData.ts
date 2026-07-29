import type { CalendarEvent, TodoItem } from "@/types";
import { generateId } from "@/lib/id";
import { nowIso, todayKey, toDateKey, addDays } from "@/lib/date/dateUtils";

/**
 * 初回起動時のサンプルデータ。
 * 「使い方が分かる少量」に留める。今日基準で日付を組み立てる。
 * 一度削除されたら復活させないため、投入は settings.sampleDataSeeded で制御する。
 */
export function buildSampleData(): {
  events: CalendarEvent[];
  todos: TodoItem[];
} {
  const now = nowIso();
  const today = todayKey();
  const inTwoDays = toDateKey(addDays(new Date(), 2));
  const tomorrow = toDateKey(addDays(new Date(), 1));

  const lectureId = generateId("evt");
  const dentistId = generateId("evt");
  const reportTodoId = generateId("todo");

  const events: CalendarEvent[] = [
    {
      id: lectureId,
      title: "大学の授業",
      date: today,
      startTime: "10:00",
      endTime: "11:30",
      isAllDay: false,
      category: "study",
      priority: "medium",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: dentistId,
      title: "歯医者",
      date: today,
      startTime: "15:00",
      endTime: "15:45",
      isAllDay: false,
      category: "health",
      priority: "medium",
      location: "駅前デンタルクリニック",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const todos: TodoItem[] = [
    {
      id: reportTodoId,
      title: "レポートを提出する",
      dueDate: inTwoDays,
      dueTime: "17:00",
      category: "study",
      priority: "high",
      isCompleted: false,
      memo: "第3章まで。PDFで提出。",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId("todo"),
      title: "牛乳を買う",
      dueDate: tomorrow,
      category: "shopping",
      priority: "low",
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return { events, todos };
}
