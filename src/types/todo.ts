import type { Category, Priority } from "./common";

/**
 * やること（ToDo）。
 * - dueDate: "yyyy-MM-dd"（締切日。任意）
 * - dueTime: "HH:mm"（締切時刻。任意。dueDate があるときのみ意味を持つ）
 */
export interface TodoItem {
  id: string;
  title: string;
  /** "yyyy-MM-dd" */
  dueDate?: string;
  /** "HH:mm" */
  dueTime?: string;
  memo?: string;
  /** 添付写真（圧縮済み data URL の配列） */
  photos?: string[];
  category: Category;
  priority: Priority;
  isCompleted: boolean;
  /** ISO 8601 文字列 */
  completedAt?: string;
  /** 紐づく予定の id（予定から作成された場合） */
  eventId?: string;
  /** ISO 8601 文字列 */
  createdAt: string;
  /** ISO 8601 文字列 */
  updatedAt: string;
}
