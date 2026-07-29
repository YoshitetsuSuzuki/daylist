import type { CalendarEvent, TodoItem } from "@/types";
import { priorityWeight } from "@/lib/constants/priorities";
import {
  parseDateKey,
  differenceInCalendarDays,
  todayKey,
} from "@/lib/date/dateUtils";
import {
  getDeadlineState,
  deadlineSortValue,
  isOverdue,
} from "@/lib/date/deadlineUtils";

/**
 * ホーム「今日やること」:
 * 今日が締切の未完了 ToDo、または今日の予定に紐づく ToDo。
 * 完了済みは showCompleted のときのみ末尾に含める。
 */
export function selectTodayTodos(
  todos: TodoItem[],
  events: CalendarEvent[],
  now: Date = new Date(),
  showCompleted = true,
): TodoItem[] {
  const today = todayKey();
  const todayEventIds = new Set(
    events.filter((e) => e.date === today).map((e) => e.id),
  );

  const matched = todos.filter((t) => {
    const dueToday = t.dueDate === today;
    const linkedToTodayEvent = t.eventId ? todayEventIds.has(t.eventId) : false;
    return dueToday || linkedToTodayEvent;
  });

  const active = matched.filter((t) => !t.isCompleted);
  const done = matched.filter((t) => t.isCompleted);

  const sorted = [...active].sort(compareTodosByDeadlineThenPriority(now));
  if (!showCompleted) return sorted;
  // 完了済みは下側へ
  return [...sorted, ...done.sort(byCompletedAtDesc)];
}

/**
 * ホーム「期限が近いやること」:
 * 今日以降〜7日以内に締切がある未完了タスク（今日ちょうども含む）。締切が近い順。
 * 期限切れは最上部に別枠で出したいので isUpcoming とは分ける（overdue を含めない）。
 */
export function selectUpcomingTodos(
  todos: TodoItem[],
  now: Date = new Date(),
  withinDays = 7,
): TodoItem[] {
  return todos
    .filter((t) => {
      if (t.isCompleted || !t.dueDate) return false;
      const due = parseDateKey(t.dueDate);
      if (!due) return false;
      const diff = differenceInCalendarDays(due, now);
      return diff >= 0 && diff <= withinDays;
    })
    .sort((a, b) => deadlineSortValue(a) - deadlineSortValue(b));
}

/** 期限切れの未完了タスク（最上部表示用） */
export function selectOverdueTodos(
  todos: TodoItem[],
  now: Date = new Date(),
): TodoItem[] {
  return todos
    .filter((t) => isOverdue(t, now))
    .sort((a, b) => deadlineSortValue(a) - deadlineSortValue(b));
}

/**
 * やること一覧の並び順:
 * 1. 期限切れ → 2. 今日 → 3. 締切が近い → 4. 締切未設定 → 5. 完了済み
 * 同じ締切区分内は締切の早い順、さらに優先度の高い順。
 */
export function sortTodosForList(
  todos: TodoItem[],
  now: Date = new Date(),
): TodoItem[] {
  return [...todos].sort((a, b) => {
    // 完了は常に最後
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    if (a.isCompleted && b.isCompleted) {
      return byCompletedAtDesc(a, b);
    }
    const ra = deadlineRank(a, now);
    const rb = deadlineRank(b, now);
    if (ra !== rb) return ra - rb;

    // 同区分は締切の早い順
    const da = deadlineSortValue(a);
    const db = deadlineSortValue(b);
    if (da !== db) return da - db;

    // 締切が同じなら優先度の高い順
    return priorityWeight(b.priority) - priorityWeight(a.priority);
  });
}

/** 締切区分ランク（小さいほど上）。overdue=0, today=1, soon/future=2, none=3 */
function deadlineRank(todo: TodoItem, now: Date): number {
  const state = getDeadlineState(todo, now);
  switch (state) {
    case "overdue":
      return 0;
    case "today":
      return 1;
    case "tomorrow":
    case "soon":
    case "future":
      return 2;
    case "none":
    default:
      return 3;
  }
}

function compareTodosByDeadlineThenPriority(now: Date) {
  return (a: TodoItem, b: TodoItem): number => {
    const ra = deadlineRank(a, now);
    const rb = deadlineRank(b, now);
    if (ra !== rb) return ra - rb;
    const da = deadlineSortValue(a);
    const db = deadlineSortValue(b);
    if (da !== db) return da - db;
    return priorityWeight(b.priority) - priorityWeight(a.priority);
  };
}

function byCompletedAtDesc(a: TodoItem, b: TodoItem): number {
  const ta = a.completedAt ? Date.parse(a.completedAt) : 0;
  const tb = b.completedAt ? Date.parse(b.completedAt) : 0;
  return tb - ta;
}

/** 未完了タスク数 */
export function countActive(todos: TodoItem[]): number {
  return todos.filter((t) => !t.isCompleted).length;
}
