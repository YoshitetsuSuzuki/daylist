import type { CalendarEvent, TodoItem } from "@/types";
import type { EventInput, TodoInput, EventDeleteMode } from "@/context/appDataTypes";
import { generateId } from "@/lib/id";

/**
 * 予定と ToDo は独立したデータとして管理し、id（eventId / linkedTodoId）で関連付ける。
 * これらは純粋関数として実装し、テスト可能にする（副作用・永続化は Context 側）。
 */

/** 予定を作成。addTodo が真なら紐づく ToDo も同時に作る。 */
export function createEventWithOptionalTodo(
  events: CalendarEvent[],
  todos: TodoItem[],
  input: EventInput,
  now: string,
): { events: CalendarEvent[]; todos: TodoItem[]; createdTodo: boolean } {
  const eventId = generateId("evt");
  const event: CalendarEvent = {
    id: eventId,
    title: input.title.trim(),
    date: input.date,
    startTime: input.isAllDay ? undefined : emptyToUndef(input.startTime),
    endTime: input.isAllDay ? undefined : emptyToUndef(input.endTime),
    isAllDay: input.isAllDay,
    memo: emptyToUndef(input.memo),
    location: emptyToUndef(input.location),
    category: input.category,
    priority: input.priority,
    color: emptyToUndef(input.color),
    photos: normPhotos(input.photos),
    createdAt: now,
    updatedAt: now,
  };

  let nextTodos = todos;
  let createdTodo = false;

  if (input.addTodo) {
    const todoId = generateId("todo");
    // 初期は予定日時を ToDo 締切として自動設定してよい
    const dueDate = input.todoDueDate ?? input.date;
    const dueTime = input.todoDueTime ?? (input.isAllDay ? undefined : input.startTime);
    const todo: TodoItem = {
      id: todoId,
      title: input.title.trim(),
      dueDate: emptyToUndef(dueDate),
      dueTime: emptyToUndef(dueTime),
      memo: emptyToUndef(input.memo),
      category: input.category,
      priority: input.priority,
      isCompleted: false,
      eventId,
      createdAt: now,
      updatedAt: now,
    };
    event.linkedTodoId = todoId;
    nextTodos = [...todos, todo];
    createdTodo = true;
  }

  return { events: [...events, event], todos: nextTodos, createdTodo };
}

/**
 * 予定を編集する。
 * - 予定のタイトルや締切を変えても、紐づく ToDo のタイトル/締切は自動変更しない。
 * - addTodo を ON にして未リンクなら ToDo を新規作成する。
 * - addTodo を OFF にして既存リンクがあれば、そのリンク ToDo を削除する（ユーザーの明示操作）。
 */
export function updateEventWithLinkage(
  events: CalendarEvent[],
  todos: TodoItem[],
  id: string,
  input: EventInput,
  now: string,
): { events: CalendarEvent[]; todos: TodoItem[] } {
  const target = events.find((e) => e.id === id);
  if (!target) return { events, todos };

  let linkedTodoId = target.linkedTodoId;
  let nextTodos = todos;

  const hasLinked =
    !!linkedTodoId && todos.some((t) => t.id === linkedTodoId);

  if (input.addTodo && !hasLinked) {
    // 新しく紐づく ToDo を作成
    const todoId = generateId("todo");
    const dueDate = input.todoDueDate ?? input.date;
    const dueTime = input.todoDueTime ?? (input.isAllDay ? undefined : input.startTime);
    const todo: TodoItem = {
      id: todoId,
      title: input.title.trim(),
      dueDate: emptyToUndef(dueDate),
      dueTime: emptyToUndef(dueTime),
      memo: emptyToUndef(input.memo),
      category: input.category,
      priority: input.priority,
      isCompleted: false,
      eventId: id,
      createdAt: now,
      updatedAt: now,
    };
    nextTodos = [...todos, todo];
    linkedTodoId = todoId;
  } else if (!input.addTodo && hasLinked) {
    // リンクを外す＝紐づく ToDo を削除
    nextTodos = todos.filter((t) => t.id !== linkedTodoId);
    linkedTodoId = undefined;
  }

  const nextEvents = events.map((e) =>
    e.id === id
      ? {
          ...e,
          title: input.title.trim(),
          date: input.date,
          startTime: input.isAllDay ? undefined : emptyToUndef(input.startTime),
          endTime: input.isAllDay ? undefined : emptyToUndef(input.endTime),
          isAllDay: input.isAllDay,
          memo: emptyToUndef(input.memo),
          location: emptyToUndef(input.location),
          category: input.category,
          priority: input.priority,
          color: emptyToUndef(input.color),
          photos: normPhotos(input.photos),
          linkedTodoId,
          updatedAt: now,
        }
      : e,
  );

  return { events: nextEvents, todos: nextTodos };
}

/**
 * 予定を削除する。
 * - "event-only": 予定だけ削除。紐づく ToDo は残し、孤立参照を防ぐため eventId をクリアする。
 * - "event-and-todo": 予定と紐づく ToDo の両方を削除。
 */
export function deleteEvent(
  events: CalendarEvent[],
  todos: TodoItem[],
  id: string,
  mode: EventDeleteMode,
  now: string,
): { events: CalendarEvent[]; todos: TodoItem[] } {
  const target = events.find((e) => e.id === id);
  const nextEvents = events.filter((e) => e.id !== id);
  if (!target) return { events: nextEvents, todos };

  const linkedId = target.linkedTodoId;
  if (!linkedId) return { events: nextEvents, todos };

  if (mode === "event-and-todo") {
    return { events: nextEvents, todos: todos.filter((t) => t.id !== linkedId) };
  }
  // event-only: 紐づく ToDo は残し、eventId を外して独立させる
  const nextTodos = todos.map((t) =>
    t.id === linkedId ? { ...t, eventId: undefined, updatedAt: now } : t,
  );
  return { events: nextEvents, todos: nextTodos };
}

/** 単独 ToDo を作成 */
export function createTodo(
  todos: TodoItem[],
  input: TodoInput,
  now: string,
): TodoItem[] {
  const todo: TodoItem = {
    id: generateId("todo"),
    title: input.title.trim(),
    dueDate: emptyToUndef(input.dueDate),
    dueTime: emptyToUndef(input.dueTime),
    memo: emptyToUndef(input.memo),
    photos: normPhotos(input.photos),
    category: input.category,
    priority: input.priority,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
  return [...todos, todo];
}

/** ToDo を編集（タイトル変更は予定タイトルに波及させない） */
export function updateTodo(
  todos: TodoItem[],
  id: string,
  input: TodoInput,
  now: string,
): TodoItem[] {
  return todos.map((t) =>
    t.id === id
      ? {
          ...t,
          title: input.title.trim(),
          dueDate: emptyToUndef(input.dueDate),
          dueTime: emptyToUndef(input.dueTime),
          memo: emptyToUndef(input.memo),
          photos: normPhotos(input.photos),
          category: input.category,
          priority: input.priority,
          updatedAt: now,
        }
      : t,
  );
}

/**
 * ToDo を削除する。ToDo だけ削除しても予定は削除しない。
 * ただし予定側の linkedTodoId が残ると孤立参照になるためクリアする。
 */
export function deleteTodo(
  events: CalendarEvent[],
  todos: TodoItem[],
  id: string,
  now: string,
): { events: CalendarEvent[]; todos: TodoItem[] } {
  const nextTodos = todos.filter((t) => t.id !== id);
  const nextEvents = events.map((e) =>
    e.linkedTodoId === id ? { ...e, linkedTodoId: undefined, updatedAt: now } : e,
  );
  return { events: nextEvents, todos: nextTodos };
}

/** 完了状態を切り替え */
export function toggleTodo(
  todos: TodoItem[],
  id: string,
  now: string,
): TodoItem[] {
  return todos.map((t) => {
    if (t.id !== id) return t;
    const isCompleted = !t.isCompleted;
    return {
      ...t,
      isCompleted,
      completedAt: isCompleted ? now : undefined,
      updatedAt: now,
    };
  });
}

function emptyToUndef(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  const trimmed = v.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** 空配列は undefined に正規化（保存データを膨らませない） */
function normPhotos(v: string[] | undefined): string[] | undefined {
  return v && v.length > 0 ? v : undefined;
}
