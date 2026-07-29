export const STORAGE_KEYS = {
  events: "daylist-events",
  todos: "daylist-todos",
  settings: "daylist-settings",
  dataVersion: "daylist-data-version",
} as const;

/** 現在のデータスキーマバージョン。将来のマイグレーションで使用 */
export const CURRENT_DATA_VERSION = 1;
