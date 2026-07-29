import type { TodoItem } from "@/types";
import {
  parseDateKey,
  combineDateTime,
  differenceInCalendarDays,
  formatJpShortDate,
  formatTime,
  todayKey,
} from "./dateUtils";

export type DeadlineState =
  | "overdue" // 期限切れ
  | "today" // 今日
  | "tomorrow" // 明日
  | "soon" // 7日以内
  | "future" // それ以降
  | "none"; // 締切なし

/** 「今」を基準に締切状態を判定する。now は差し込み可能（テスト用） */
export function getDeadlineState(todo: TodoItem, now: Date = new Date()): DeadlineState {
  if (!todo.dueDate) return "none";
  const due = combineDateTime(todo.dueDate, todo.dueTime);
  if (!due) return "none";

  // 締切時刻がある場合は時刻まで見て期限切れ判定。
  // 時刻が無い場合はその日の終わり（翌日0:00直前）までを猶予とする。
  if (todo.dueTime) {
    if (due.getTime() < now.getTime()) return "overdue";
  } else {
    const dueDay = parseDateKey(todo.dueDate);
    if (dueDay) {
      const diffDays = differenceInCalendarDays(dueDay, now);
      if (diffDays < 0) return "overdue";
    }
  }

  const dueDay = parseDateKey(todo.dueDate);
  if (!dueDay) return "none";
  const diff = differenceInCalendarDays(dueDay, now);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return "soon";
  return "future";
}

/** 締切の表示ラベル。例: "今日 15:00" / "明日" / "7月31日" / "期限切れ" / "締切なし" */
export function formatDeadlineLabel(todo: TodoItem, now: Date = new Date()): string {
  if (!todo.dueDate) return "締切なし";
  const dueDay = parseDateKey(todo.dueDate);
  if (!dueDay) return "締切なし";

  const state = getDeadlineState(todo, now);
  const timePart = todo.dueTime ? ` ${formatTimeStr(todo.dueTime)}` : "";

  switch (state) {
    case "overdue":
      return `期限切れ${timePart}`;
    case "today":
      return `今日${timePart}`;
    case "tomorrow":
      return `明日${timePart}`;
    default:
      return `${formatJpShortDate(dueDay)}${timePart}`;
  }
}

function formatTimeStr(time: string): string {
  // "HH:mm" をそのまま返す（正規化のみ）
  const d = combineDateTime(todayKey(), time);
  return d ? formatTime(d) : time;
}

/** 締切のソート用キー（早いほど小さい）。締切なしは最大値。 */
export function deadlineSortValue(todo: TodoItem): number {
  if (!todo.dueDate) return Number.MAX_SAFE_INTEGER;
  const due = combineDateTime(todo.dueDate, todo.dueTime ?? "23:59");
  return due ? due.getTime() : Number.MAX_SAFE_INTEGER;
}

export function isOverdue(todo: TodoItem, now: Date = new Date()): boolean {
  return !todo.isCompleted && getDeadlineState(todo, now) === "overdue";
}
