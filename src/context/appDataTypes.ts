import type { CalendarEvent, TodoItem, Settings, Category, Priority } from "@/types";

/** 予定の作成/編集フォームが渡す値 */
export interface EventInput {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  memo?: string;
  location?: string;
  category: Category;
  priority: Priority;
  color?: string;
  /** 添付写真（圧縮済み data URL の配列） */
  photos?: string[];
  /** ToDo リストに追加するか */
  addTodo: boolean;
  /** 追加する ToDo の締切（未指定なら予定日を使う） */
  todoDueDate?: string;
  todoDueTime?: string;
}

/** ToDo の作成/編集フォームが渡す値 */
export interface TodoInput {
  title: string;
  dueDate?: string;
  dueTime?: string;
  memo?: string;
  /** 添付写真（圧縮済み data URL の配列） */
  photos?: string[];
  category: Category;
  priority: Priority;
}

/** 予定削除時の紐づき ToDo の扱い */
export type EventDeleteMode = "event-only" | "event-and-todo";

export interface AppData {
  events: CalendarEvent[];
  todos: TodoItem[];
  settings: Settings;
  /** 選択中の日付 "yyyy-MM-dd"（未初期化時は空文字） */
  selectedDate: string;
  /** 表示中の月 "yyyy-MM"（未初期化時は空文字） */
  viewMonth: string;
  /** クライアントでの読み込み完了フラグ */
  initialized: boolean;
}
