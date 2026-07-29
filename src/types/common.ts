// 共通の基本型。将来 Supabase 移行時もこの型を保てるよう、プリミティブで表現する。

/** 優先度 */
export type Priority = "low" | "medium" | "high";

/** カテゴリー */
export type Category =
  | "work"
  | "study"
  | "personal"
  | "health"
  | "shopping"
  | "other";
