import type { CalendarEvent, TodoItem, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import {
  readJson,
  writeJson,
  type StorageResult,
} from "./safeStorage";
import { STORAGE_KEYS } from "./storageKeys";
import {
  salvageEvents,
  salvageTodos,
  isSettings,
} from "./guards";

/**
 * 永続化のリポジトリ層。
 * UI/Context はこの関数群のみを通して localStorage にアクセスする。
 * 将来 Supabase へ移行する際は、この層の実装を差し替えるだけでよい。
 */

export const eventRepository = {
  load(): CalendarEvent[] {
    // 破損時も有効な要素だけ救出（部分復旧）
    const raw = readJson<unknown>(STORAGE_KEYS.events, []);
    return salvageEvents(raw);
  },
  save(events: CalendarEvent[]): StorageResult<true> {
    return writeJson(STORAGE_KEYS.events, events);
  },
};

export const todoRepository = {
  load(): TodoItem[] {
    const raw = readJson<unknown>(STORAGE_KEYS.todos, []);
    return salvageTodos(raw);
  },
  save(todos: TodoItem[]): StorageResult<true> {
    return writeJson(STORAGE_KEYS.todos, todos);
  },
};

export const settingsRepository = {
  load(): Settings {
    const raw = readJson<unknown>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    if (isSettings(raw)) return raw;
    // 部分的に壊れていても既定値で補完
    return { ...DEFAULT_SETTINGS };
  },
  save(settings: Settings): StorageResult<true> {
    return writeJson(STORAGE_KEYS.settings, settings);
  },
};
