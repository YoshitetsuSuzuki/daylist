import {
  format,
  parse,
  isValid,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays,
  isSameDay,
} from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 日付の扱い方針:
 * - "日付のみ" の値は "yyyy-MM-dd" 文字列で保持し、Date に変換する際は
 *   ローカル（＝端末＝日本時間）の 0:00 として解釈する。
 * - new Date("2026-07-29") は UTC 0:00 と解釈され日付がずれるため使用しない。
 *   代わりに parseDateKey / makeLocalDate を用いる。
 */

const DATE_KEY = "yyyy-MM-dd";
const TIME_KEY = "HH:mm";

/** ローカルタイムで年月日から Date を作る（0:00） */
export function makeLocalDate(year: number, month1: number, day: number): Date {
  return new Date(year, month1 - 1, day, 0, 0, 0, 0);
}

/** "yyyy-MM-dd" をローカル 0:00 の Date に変換（不正なら null） */
export function parseDateKey(key: string | undefined | null): Date | null {
  if (!key) return null;
  const d = parse(key, DATE_KEY, new Date());
  return isValid(d) ? d : null;
}

/** Date を "yyyy-MM-dd" に整形（ローカル基準） */
export function toDateKey(date: Date): string {
  return format(date, DATE_KEY);
}

/** 現在時刻（ISO 8601） */
export function nowIso(): string {
  return new Date().toISOString();
}

/** 今日の "yyyy-MM-dd"（ローカル） */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** "yyyy-MM-dd" 形式として妥当か */
export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return parseDateKey(key) !== null;
}

/** "HH:mm" 形式として妥当か */
export function isValidTimeKey(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/**
 * 日付キー("yyyy-MM-dd")と任意の時刻("HH:mm")を合成し、ローカルの Date にする。
 * 時刻が無ければ 0:00。締切なし判定は呼び出し側で date の有無を見る。
 */
export function combineDateTime(
  dateKey: string,
  timeKey?: string,
): Date | null {
  const base = parseDateKey(dateKey);
  if (!base) return null;
  if (timeKey && isValidTimeKey(timeKey)) {
    const [h, m] = timeKey.split(":").map(Number);
    base.setHours(h, m, 0, 0);
  }
  return base;
}

/** 時刻文字列を数値比較用の分に変換（"HH:mm" → 分） */
export function timeToMinutes(time?: string): number | null {
  if (!time || !isValidTimeKey(time)) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// 期間・移動系（カレンダー生成などで使用）
export {
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  differenceInCalendarDays,
  isSameDay,
};

/** 曜日つきの日本語日付。例: "7月29日 水曜日" */
export function formatJpLongDate(date: Date): string {
  return format(date, "M月d日 EEEE", { locale: ja });
}

/** 短い日本語日付。例: "7月31日" */
export function formatJpShortDate(date: Date): string {
  return format(date, "M月d日", { locale: ja });
}

/** 時刻。例: "17:00" */
export function formatTime(date: Date): string {
  return format(date, TIME_KEY);
}

/** 年月見出し。例: "2026年7月" */
export function formatJpYearMonth(date: Date): string {
  return format(date, "yyyy年M月", { locale: ja });
}

/** 曜日一文字（日〜土）。weekStartsOn に応じた並びで返す */
export function weekdayLabels(weekStartsOn: 0 | 1): string[] {
  const base = ["日", "月", "火", "水", "木", "金", "土"];
  if (weekStartsOn === 1) {
    return [...base.slice(1), base[0]];
  }
  return base;
}
