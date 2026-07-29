"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type { CalendarEvent, TodoItem, Settings } from "@/types";
import { appDataReducer, initialAppData } from "./appDataReducer";
import type {
  EventInput,
  TodoInput,
  EventDeleteMode,
  AppData,
} from "./appDataTypes";
import {
  eventRepository,
  todoRepository,
  settingsRepository,
} from "@/lib/storage/repositories";
import { runMigrations } from "@/lib/storage/migrations";
import { buildSampleData } from "@/lib/storage/sampleData";
import { nowIso, todayKey } from "@/lib/date/dateUtils";
import {
  createEventWithOptionalTodo,
  updateEventWithLinkage,
  deleteEvent as deleteEventMutation,
  createTodo,
  updateTodo,
  deleteTodo as deleteTodoMutation,
  toggleTodo,
} from "@/lib/mutations";
import { useToast } from "./ToastContext";
import type { StorageResult } from "@/lib/storage/safeStorage";

interface AppDataContextValue {
  data: AppData;
  // 予定
  addEvent: (input: EventInput) => void;
  updateEvent: (id: string, input: EventInput) => void;
  deleteEvent: (id: string, mode: EventDeleteMode) => void;
  // ToDo
  addTodo: (input: TodoInput) => void;
  editTodo: (id: string, input: TodoInput) => void;
  removeTodo: (id: string) => void;
  toggleTodoCompleted: (id: string) => void;
  // 選択・表示
  setSelectedDate: (dateKey: string) => void;
  setViewMonth: (monthKey: string) => void;
  // 設定・データ
  updateSettings: (patch: Partial<Settings>) => void;
  clearSampleData: () => void;
  clearAllData: () => void;
  importAll: (payload: {
    events: CalendarEvent[];
    todos: TodoItem[];
    settings: Settings;
  }) => void;
  // 参照ヘルパー
  getEvent: (id: string) => CalendarEvent | undefined;
  getTodo: (id: string) => TodoItem | undefined;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function currentMonthKey(): string {
  return todayKey().slice(0, 7); // "yyyy-MM"
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(appDataReducer, initialAppData);
  const { showToast } = useToast();
  // 保存エラーの連投トーストを防ぐ
  const storageErrorShown = useRef(false);

  // 初回マウント時（クライアント）にロード＋マイグレーション＋サンプル投入
  useEffect(() => {
    runMigrations();
    let events = eventRepository.load();
    let todos = todoRepository.load();
    const settings = settingsRepository.load();

    let nextSettings = settings;
    // サンプルデータ：一度も投入しておらず、かつ空のときだけ入れる
    if (
      !settings.sampleDataSeeded &&
      events.length === 0 &&
      todos.length === 0
    ) {
      const sample = buildSampleData();
      events = sample.events;
      todos = sample.todos;
      nextSettings = { ...settings, sampleDataSeeded: true };
      eventRepository.save(events);
      todoRepository.save(todos);
      settingsRepository.save(nextSettings);
    } else if (!settings.sampleDataSeeded) {
      // 既存データがある場合はサンプルを投入せず、フラグだけ立てる
      nextSettings = { ...settings, sampleDataSeeded: true };
      settingsRepository.save(nextSettings);
    }

    const today = todayKey();
    dispatch({
      type: "INIT",
      payload: {
        events,
        todos,
        settings: nextSettings,
        selectedDate: today,
        viewMonth: currentMonthKey(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageResult = (result: StorageResult<true>) => {
    if (result.ok) return;
    if (storageErrorShown.current) return;
    storageErrorShown.current = true;
    const msg =
      result.error === "quota"
        ? "保存容量の上限に達しました。不要なデータを削除してください。"
        : result.error === "unavailable"
          ? "このブラウザではデータを保存できません（プライベートモード等）。"
          : "データの保存に失敗しました。";
    showToast(msg, "error");
    // 少し時間を置けば再度出せるように
    setTimeout(() => {
      storageErrorShown.current = false;
    }, 5000);
  };

  const persistEvents = (events: CalendarEvent[]) => {
    handleStorageResult(eventRepository.save(events));
  };
  const persistTodos = (todos: TodoItem[]) => {
    handleStorageResult(todoRepository.save(todos));
  };
  const persistSettings = (settings: Settings) => {
    handleStorageResult(settingsRepository.save(settings));
  };

  // ---- 予定 ----
  const addEvent = (input: EventInput) => {
    const now = nowIso();
    const { events, todos, createdTodo } = createEventWithOptionalTodo(
      data.events,
      data.todos,
      input,
      now,
    );
    dispatch({ type: "SET_EVENTS_AND_TODOS", payload: { events, todos } });
    persistEvents(events);
    if (createdTodo) persistTodos(todos);
    showToast(createdTodo ? "予定とやることを保存しました" : "予定を保存しました");
  };

  const updateEvent = (id: string, input: EventInput) => {
    const now = nowIso();
    const { events, todos } = updateEventWithLinkage(
      data.events,
      data.todos,
      id,
      input,
      now,
    );
    dispatch({ type: "SET_EVENTS_AND_TODOS", payload: { events, todos } });
    persistEvents(events);
    persistTodos(todos);
    showToast("予定を更新しました");
  };

  const deleteEvent = (id: string, mode: EventDeleteMode) => {
    const now = nowIso();
    const { events, todos } = deleteEventMutation(
      data.events,
      data.todos,
      id,
      mode,
      now,
    );
    dispatch({ type: "SET_EVENTS_AND_TODOS", payload: { events, todos } });
    persistEvents(events);
    persistTodos(todos);
    showToast(
      mode === "event-and-todo"
        ? "予定と紐づくやることを削除しました"
        : "予定を削除しました",
    );
  };

  // ---- ToDo ----
  const addTodo = (input: TodoInput) => {
    const now = nowIso();
    const todos = createTodo(data.todos, input, now);
    dispatch({ type: "SET_TODOS", payload: todos });
    persistTodos(todos);
    showToast("やることを保存しました");
  };

  const editTodo = (id: string, input: TodoInput) => {
    const now = nowIso();
    const todos = updateTodo(data.todos, id, input, now);
    dispatch({ type: "SET_TODOS", payload: todos });
    persistTodos(todos);
    showToast("やることを更新しました");
  };

  const removeTodo = (id: string) => {
    const now = nowIso();
    const { events, todos } = deleteTodoMutation(
      data.events,
      data.todos,
      id,
      now,
    );
    dispatch({ type: "SET_EVENTS_AND_TODOS", payload: { events, todos } });
    persistTodos(todos);
    persistEvents(events);
    showToast("やることを削除しました");
  };

  const toggleTodoCompleted = (id: string) => {
    const now = nowIso();
    const todos = toggleTodo(data.todos, id, now);
    dispatch({ type: "SET_TODOS", payload: todos });
    persistTodos(todos);
    const target = todos.find((t) => t.id === id);
    if (target) {
      showToast(target.isCompleted ? "完了にしました" : "完了を取り消しました");
    }
  };

  // ---- 選択・表示 ----
  const setSelectedDate = (dateKey: string) => {
    dispatch({ type: "SET_SELECTED_DATE", payload: dateKey });
  };
  const setViewMonth = (monthKey: string) => {
    dispatch({ type: "SET_VIEW_MONTH", payload: monthKey });
  };

  // ---- 設定・データ ----
  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...data.settings, ...patch };
    dispatch({ type: "SET_SETTINGS", payload: next });
    persistSettings(next);
  };

  const clearSampleData = () => {
    // サンプルは「サンプル由来か」を厳密に区別しないため、全予定・全ToDoを消す挙動ではなく、
    // ここでは「全データ削除」との差別化として、初期サンプルと同一構成のみ消すのは困難。
    // MVP では『すべてのデータを削除』と同じく空にし、再投入も防ぐ。
    const emptyEvents: CalendarEvent[] = [];
    const emptyTodos: TodoItem[] = [];
    const next = { ...data.settings, sampleDataSeeded: true };
    dispatch({
      type: "REPLACE_ALL",
      payload: { events: emptyEvents, todos: emptyTodos, settings: next },
    });
    persistEvents(emptyEvents);
    persistTodos(emptyTodos);
    persistSettings(next);
    showToast("サンプルデータを削除しました");
  };

  const clearAllData = () => {
    const emptyEvents: CalendarEvent[] = [];
    const emptyTodos: TodoItem[] = [];
    const next = { ...data.settings, sampleDataSeeded: true };
    dispatch({
      type: "REPLACE_ALL",
      payload: { events: emptyEvents, todos: emptyTodos, settings: next },
    });
    persistEvents(emptyEvents);
    persistTodos(emptyTodos);
    persistSettings(next);
    showToast("すべてのデータを削除しました");
  };

  const importAll = (payload: {
    events: CalendarEvent[];
    todos: TodoItem[];
    settings: Settings;
  }) => {
    // インポートしたデータはサンプル復活を防ぐためフラグを立てる
    const settings = { ...payload.settings, sampleDataSeeded: true };
    dispatch({
      type: "REPLACE_ALL",
      payload: { events: payload.events, todos: payload.todos, settings },
    });
    persistEvents(payload.events);
    persistTodos(payload.todos);
    persistSettings(settings);
    showToast("データをインポートしました");
  };

  const getEvent = (id: string) => data.events.find((e) => e.id === id);
  const getTodo = (id: string) => data.todos.find((t) => t.id === id);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      addEvent,
      updateEvent,
      deleteEvent,
      addTodo,
      editTodo,
      removeTodo,
      toggleTodoCompleted,
      setSelectedDate,
      setViewMonth,
      updateSettings,
      clearSampleData,
      clearAllData,
      importAll,
      getEvent,
      getTodo,
    }),
    // data の変化で更新すれば十分（メソッドは data クロージャに依存）
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData は AppDataProvider の内側で使用してください。");
  }
  return ctx;
}
