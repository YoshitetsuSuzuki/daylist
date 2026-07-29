import { describe, it, expect } from "vitest";
import {
  selectTodayTodos,
  selectUpcomingTodos,
  selectOverdueTodos,
  sortTodosForList,
  countActive,
} from "./todoSelectors";
import { makeTodo, makeEvent, NOW } from "@/lib/__tests__/fixtures";

describe("selectTodayTodos", () => {
  it("今日締切の未完了を抽出する", () => {
    const todos = [
      makeTodo({ id: "a", dueDate: "2026-07-29" }),
      makeTodo({ id: "b", dueDate: "2026-07-30" }),
    ];
    const result = selectTodayTodos(todos, [], NOW);
    expect(result.map((t) => t.id)).toEqual(["a"]);
  });

  it("今日の予定に紐づく ToDo も含む", () => {
    const event = makeEvent({ id: "e1", date: "2026-07-29" });
    const todos = [
      makeTodo({ id: "linked", dueDate: "2026-08-10", eventId: "e1" }),
    ];
    const result = selectTodayTodos(todos, [event], NOW);
    expect(result.map((t) => t.id)).toContain("linked");
  });

  it("完了済みは末尾へ、showCompleted=false なら除外", () => {
    const todos = [
      makeTodo({ id: "done", dueDate: "2026-07-29", isCompleted: true, completedAt: "2026-07-29T10:00:00Z" }),
      makeTodo({ id: "active", dueDate: "2026-07-29" }),
    ];
    const withDone = selectTodayTodos(todos, [], NOW, true);
    expect(withDone.map((t) => t.id)).toEqual(["active", "done"]);
    const withoutDone = selectTodayTodos(todos, [], NOW, false);
    expect(withoutDone.map((t) => t.id)).toEqual(["active"]);
  });
});

describe("selectUpcomingTodos", () => {
  it("今日〜7日以内の未完了を締切順で返す", () => {
    const todos = [
      makeTodo({ id: "far", dueDate: "2026-08-30" }),
      makeTodo({ id: "d3", dueDate: "2026-08-01" }),
      makeTodo({ id: "d1", dueDate: "2026-07-30" }),
      makeTodo({ id: "done", dueDate: "2026-07-31", isCompleted: true }),
      makeTodo({ id: "past", dueDate: "2026-07-01" }),
    ];
    const result = selectUpcomingTodos(todos, NOW);
    expect(result.map((t) => t.id)).toEqual(["d1", "d3"]);
  });
});

describe("selectOverdueTodos", () => {
  it("期限切れの未完了のみ", () => {
    const todos = [
      makeTodo({ id: "over", dueDate: "2026-07-20" }),
      makeTodo({ id: "overDone", dueDate: "2026-07-20", isCompleted: true }),
      makeTodo({ id: "today", dueDate: "2026-07-29" }),
    ];
    const result = selectOverdueTodos(todos, NOW);
    expect(result.map((t) => t.id)).toEqual(["over"]);
  });
});

describe("sortTodosForList", () => {
  it("期限切れ→今日→近い→締切なし→完了 の順、同順は優先度高が上", () => {
    const todos = [
      makeTodo({ id: "none", dueDate: undefined }),
      makeTodo({ id: "completed", dueDate: "2026-07-20", isCompleted: true }),
      makeTodo({ id: "soon", dueDate: "2026-08-01" }),
      makeTodo({ id: "overdue", dueDate: "2026-07-20" }),
      makeTodo({ id: "today", dueDate: "2026-07-29" }),
    ];
    const result = sortTodosForList(todos, NOW);
    expect(result.map((t) => t.id)).toEqual([
      "overdue",
      "today",
      "soon",
      "none",
      "completed",
    ]);
  });

  it("同じ締切なら優先度が高い方が上", () => {
    const todos = [
      makeTodo({ id: "low", dueDate: "2026-07-29", dueTime: "10:00", priority: "low" }),
      makeTodo({ id: "high", dueDate: "2026-07-29", dueTime: "10:00", priority: "high" }),
    ];
    // NOW=12:00 なので両方 overdue（時刻10:00）だが締切値は同じ → 優先度比較
    const result = sortTodosForList(todos, NOW);
    expect(result.map((t) => t.id)).toEqual(["high", "low"]);
  });
});

describe("countActive", () => {
  it("未完了数を数える", () => {
    const todos = [
      makeTodo({ isCompleted: false }),
      makeTodo({ isCompleted: true }),
      makeTodo({ isCompleted: false }),
    ];
    expect(countActive(todos)).toBe(2);
  });
});
