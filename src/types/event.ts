import type { Category, Priority } from "./common";

/**
 * カレンダー予定。
 * - date: "yyyy-MM-dd"（日本時間基準の日付のみ。UTC日時とは混在させない）
 * - startTime / endTime: "HH:mm"（終日でない場合）
 */
export interface CalendarEvent {
  id: string;
  title: string;
  /** "yyyy-MM-dd" */
  date: string;
  /** "HH:mm" */
  startTime?: string;
  /** "HH:mm" */
  endTime?: string;
  isAllDay: boolean;
  memo?: string;
  location?: string;
  category: Category;
  priority: Priority;
  /** 任意のアクセントカラー（未指定ならカテゴリー色） */
  color?: string;
  /** 添付写真（圧縮済み data URL の配列） */
  photos?: string[];
  /** 紐づく ToDo の id（予定→ToDo で作成した場合） */
  linkedTodoId?: string;
  /** ISO 8601 文字列 */
  createdAt: string;
  /** ISO 8601 文字列 */
  updatedAt: string;
}
