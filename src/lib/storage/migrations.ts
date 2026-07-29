import { readRaw, writeJson } from "./safeStorage";
import { STORAGE_KEYS, CURRENT_DATA_VERSION } from "./storageKeys";

/**
 * データバージョンを読み、必要ならマイグレーションを実行する。
 * 現状 v1 のみ。将来スキーマ変更時はここに変換関数を追加する。
 *
 * 例:
 *   if (from < 2) { ...v1→v2 変換... }
 */
export function runMigrations(): void {
  const raw = readRaw(STORAGE_KEYS.dataVersion);
  const from = raw ? Number.parseInt(raw, 10) : 0;

  if (Number.isNaN(from) || from >= CURRENT_DATA_VERSION) {
    // 破損 or 最新。バージョンを正規化して終了。
    writeJson(STORAGE_KEYS.dataVersion, CURRENT_DATA_VERSION);
    return;
  }

  // --- 将来のマイグレーションをここに追加 ---
  // if (from < 2) { migrateV1toV2(); }

  writeJson(STORAGE_KEYS.dataVersion, CURRENT_DATA_VERSION);
}
