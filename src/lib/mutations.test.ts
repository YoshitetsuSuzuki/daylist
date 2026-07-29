import { describe, it, expect } from "vitest";
import {
  createEventWithOptionalTodo,
  updateEventWithLinkage,
  deleteEvent,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
} from "./mutations";
import { makeEvent, makeTodo } from "@/lib/__tests__/fixtures";
import type { EventInput, TodoInput } from "@/context/appDataTypes";

const NOW_ISO = "2026-07-29T12:00:00.000Z";

function eventInput(over: Partial<EventInput> = {}): EventInput {
  return {
    title: "会議",
    date: "2026-07-29",
    isAllDay: false,
    startTime: "13:00",
    endTime: "14:00",
    category: "work",
    priority: "medium",
    addTodo: false,
    ...over,
  };
}
function todoInput(over: Partial<TodoInput> = {}): TodoInput {
  return {
    title: "買い物",
    category: "shopping",
    priority: "low",
    ...over,
  };
}

describe("createEventWithOptionalTodo", () => {
  it("addTodo=false なら予定のみ作成", () => {
    const r = createEventWithOptionalTodo([], [], eventInput(), NOW_ISO);
    expect(r.events).toHaveLength(1);
    expect(r.todos).toHaveLength(0);
    expect(r.events[0].linkedTodoId).toBeUndefined();
  });

  it("addTodo=true なら ToDo も作成し相互リンクする", () => {
    const r = createEventWithOptionalTodo([], [], eventInput({ addTodo: true }), NOW_ISO);
    expect(r.events).toHaveLength(1);
    expect(r.todos).toHaveLength(1);
    const ev = r.events[0];
    const td = r.todos[0];
    expect(ev.linkedTodoId).toBe(td.id);
    expect(td.eventId).toBe(ev.id);
    // 締切未指定なら予定日時が入る
    expect(td.dueDate).toBe("2026-07-29");
    expect(td.dueTime).toBe("13:00");
  });

  it("ToDo 締切を別指定できる", () => {
    const r = createEventWithOptionalTodo(
      [],
      [],
      eventInput({ addTodo: true, todoDueDate: "2026-07-28", todoDueTime: "21:00" }),
      NOW_ISO,
    );
    expect(r.todos[0].dueDate).toBe("2026-07-28");
    expect(r.todos[0].dueTime).toBe("21:00");
  });
});

describe("updateEventWithLinkage", () => {
  it("addTodo を ON にすると紐づく ToDo を新規作成", () => {
    const ev = makeEvent({ id: "e1" });
    const r = updateEventWithLinkage([ev], [], "e1", eventInput({ addTodo: true }), NOW_ISO);
    expect(r.todos).toHaveLength(1);
    expect(r.events[0].linkedTodoId).toBe(r.todos[0].id);
  });

  it("addTodo を OFF にすると紐づく ToDo を削除しリンクを外す", () => {
    const td = makeTodo({ id: "t1", eventId: "e1" });
    const ev = makeEvent({ id: "e1", linkedTodoId: "t1" });
    const r = updateEventWithLinkage([ev], [td], "e1", eventInput({ addTodo: false }), NOW_ISO);
    expect(r.todos).toHaveLength(0);
    expect(r.events[0].linkedTodoId).toBeUndefined();
  });

  it("予定タイトル変更は既存 ToDo のタイトル/締切を変えない", () => {
    const td = makeTodo({ id: "t1", eventId: "e1", title: "元のToDo", dueDate: "2026-08-01" });
    const ev = makeEvent({ id: "e1", linkedTodoId: "t1" });
    const r = updateEventWithLinkage(
      [ev],
      [td],
      "e1",
      eventInput({ addTodo: true, title: "新しい予定名" }),
      NOW_ISO,
    );
    const keptTodo = r.todos.find((t) => t.id === "t1")!;
    expect(keptTodo.title).toBe("元のToDo");
    expect(keptTodo.dueDate).toBe("2026-08-01");
    expect(r.events[0].title).toBe("新しい予定名");
  });
});

describe("deleteEvent", () => {
  it("event-only は予定だけ削除し ToDo の eventId を外す", () => {
    const td = makeTodo({ id: "t1", eventId: "e1" });
    const ev = makeEvent({ id: "e1", linkedTodoId: "t1" });
    const r = deleteEvent([ev], [td], "e1", "event-only", NOW_ISO);
    expect(r.events).toHaveLength(0);
    expect(r.todos).toHaveLength(1);
    expect(r.todos[0].eventId).toBeUndefined();
  });

  it("event-and-todo は両方削除", () => {
    const td = makeTodo({ id: "t1", eventId: "e1" });
    const ev = makeEvent({ id: "e1", linkedTodoId: "t1" });
    const r = deleteEvent([ev], [td], "e1", "event-and-todo", NOW_ISO);
    expect(r.events).toHaveLength(0);
    expect(r.todos).toHaveLength(0);
  });
});

describe("createTodo / updateTodo", () => {
  it("単独 ToDo を作成（eventId なし）", () => {
    const todos = createTodo([], todoInput(), NOW_ISO);
    expect(todos).toHaveLength(1);
    expect(todos[0].eventId).toBeUndefined();
  });
  it("ToDo を編集してもタイトルが更新される", () => {
    const todos = updateTodo([makeTodo({ id: "t1" })], "t1", todoInput({ title: "更新後" }), NOW_ISO);
    expect(todos[0].title).toBe("更新後");
  });
});

describe("deleteTodo", () => {
  it("ToDo 削除で予定側の linkedTodoId を外す（予定は残る）", () => {
    const td = makeTodo({ id: "t1", eventId: "e1" });
    const ev = makeEvent({ id: "e1", linkedTodoId: "t1" });
    const r = deleteTodo([ev], [td], "t1", NOW_ISO);
    expect(r.todos).toHaveLength(0);
    expect(r.events).toHaveLength(1);
    expect(r.events[0].linkedTodoId).toBeUndefined();
  });
});

describe("toggleTodo", () => {
  it("完了/未完了を切り替え completedAt を設定/解除", () => {
    const t1 = toggleTodo([makeTodo({ id: "t1", isCompleted: false })], "t1", NOW_ISO);
    expect(t1[0].isCompleted).toBe(true);
    expect(t1[0].completedAt).toBe(NOW_ISO);
    const t2 = toggleTodo(t1, "t1", NOW_ISO);
    expect(t2[0].isCompleted).toBe(false);
    expect(t2[0].completedAt).toBeUndefined();
  });
});
