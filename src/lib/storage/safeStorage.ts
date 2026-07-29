/**
 * localStorage への安全なアクセス層。
 * - SSR（window 無し）でも例外を投げない
 * - 使用不可・容量超過・不正 JSON でもアプリを落とさない
 * - JSON パースはコンポーネントに散らさず、この層に集約する
 */

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: StorageError };

export type StorageError =
  | "unavailable" // localStorage 自体が使えない
  | "quota" // 容量超過
  | "parse" // JSON 破損
  | "write"; // その他の書き込み失敗

let availabilityCache: boolean | null = null;

/** localStorage が使用可能か（一度だけ実検証してキャッシュ） */
export function isStorageAvailable(): boolean {
  if (availabilityCache !== null) return availabilityCache;
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      availabilityCache = false;
      return false;
    }
    const testKey = "__daylist_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    availabilityCache = true;
    return true;
  } catch {
    availabilityCache = false;
    return false;
  }
}

/** 生の文字列を読む */
export function readRaw(key: string): string | null {
  if (!isStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * JSON を読み、失敗時は fallback を返す。
 * validate を渡すと形が合わない場合も fallback にフォールバックする。
 */
export function readJson<T>(
  key: string,
  fallback: T,
  validate?: (data: unknown) => data is T,
): T {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    // 破損データ。アプリを落とさず初期値へ。
    return fallback;
  }
}

/** JSON を書き込む。結果を返す（呼び出し側でトースト等に使う） */
export function writeJson(key: string, value: unknown): StorageResult<true> {
  if (!isStorageAvailable()) {
    return { ok: false, error: "unavailable" };
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true, value: true };
  } catch (e) {
    const isQuota =
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, error: isQuota ? "quota" : "write" };
  }
}

/** キーを削除 */
export function removeKey(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 無視
  }
}

/** テスト用: 使用可否キャッシュをリセット */
export function __resetStorageAvailabilityCache(): void {
  availabilityCache = null;
}
