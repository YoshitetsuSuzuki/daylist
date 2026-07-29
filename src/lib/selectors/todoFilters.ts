import type { TodoItem } from "@/types";
import { getCategory } from "@/lib/constants/categories";
import { getDeadlineState } from "@/lib/date/deadlineUtils";
import type { TodoFilter } from "@/components/todos/FilterPanel";

export type TodoTab = "active" | "completed" | "all";

/** タブによる完了状態の絞り込み */
export function applyTab(todos: TodoItem[], tab: TodoTab): TodoItem[] {
  if (tab === "active") return todos.filter((t) => !t.isCompleted);
  if (tab === "completed") return todos.filter((t) => t.isCompleted);
  return todos;
}

/** 検索：タイトル・メモ・カテゴリー名を対象に部分一致（大文字小文字無視） */
export function applySearch(todos: TodoItem[], query: string): TodoItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return todos;
  return todos.filter((t) => {
    const catLabel = getCategory(t.category).label.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.memo?.toLowerCase().includes(q) ?? false) ||
      catLabel.includes(q)
    );
  });
}

/** フィルターパネルの条件を適用 */
export function applyFilter(
  todos: TodoItem[],
  filter: TodoFilter,
  now: Date = new Date(),
): TodoItem[] {
  return todos.filter((t) => {
    if (filter.category !== "all" && t.category !== filter.category) return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    if (filter.link === "linked" && !t.eventId) return false;
    if (filter.link === "standalone" && t.eventId) return false;

    if (filter.deadline !== "all") {
      const state = getDeadlineState(t, now);
      if (filter.deadline === "overdue" && state !== "overdue") return false;
      if (filter.deadline === "today" && state !== "today") return false;
      if (
        filter.deadline === "week" &&
        !["today", "tomorrow", "soon"].includes(state)
      )
        return false;
      if (filter.deadline === "none" && state !== "none") return false;
    }
    return true;
  });
}
