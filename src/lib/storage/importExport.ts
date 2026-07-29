import type { CalendarEvent, TodoItem, Settings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import { CURRENT_DATA_VERSION } from "./storageKeys";
import { salvageEvents, salvageTodos, isSettings } from "./guards";

export interface ExportBundle {
  app: "daylist";
  version: number;
  exportedAt: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  settings: Settings;
}

export function buildExportBundle(
  events: CalendarEvent[],
  todos: TodoItem[],
  settings: Settings,
  exportedAt: string,
): ExportBundle {
  return {
    app: "daylist",
    version: CURRENT_DATA_VERSION,
    exportedAt,
    events,
    todos,
    settings,
  };
}

export type ImportResult =
  | {
      ok: true;
      events: CalendarEvent[];
      todos: TodoItem[];
      settings: Settings;
    }
  | { ok: false; error: string };

/**
 * インポート JSON を検証して取り込む。
 * 不正なファイルで既存データが壊れないよう、パース/形式検証を厳格に行い、
 * 有効な要素のみを救出する。全体が壊れていればエラーを返す。
 */
export function parseImport(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "ファイルが正しいJSON形式ではありません。" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "データ形式が正しくありません。" };
  }

  const obj = parsed as Record<string, unknown>;

  // app フィールドがあれば daylist であることを確認（無くても寛容に受け入れる）
  if ("app" in obj && obj.app !== "daylist") {
    return { ok: false, error: "DayList のデータではないようです。" };
  }

  const hasEvents = "events" in obj;
  const hasTodos = "todos" in obj;
  if (!hasEvents && !hasTodos) {
    return {
      ok: false,
      error: "予定・やることのデータが見つかりませんでした。",
    };
  }

  const events = salvageEvents(obj.events);
  const todos = salvageTodos(obj.todos);
  const settings = isSettings(obj.settings)
    ? (obj.settings as Settings)
    : { ...DEFAULT_SETTINGS };

  return { ok: true, events, todos, settings };
}
