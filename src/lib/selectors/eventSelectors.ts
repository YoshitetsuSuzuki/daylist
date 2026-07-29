import type { CalendarEvent } from "@/types";
import { parseDateKey, differenceInCalendarDays } from "@/lib/date/dateUtils";

/**
 * 指定した月("yyyy-MM")に含まれる予定を、日付→開始時刻の近い順で返す。
 * ホームのカレンダー下「その月の予定」一覧に使用（月を切り替えると更新）。
 */
export function selectEventsInMonth(
  events: CalendarEvent[],
  monthKey: string,
): CalendarEvent[] {
  return events
    .filter((e) => e.date.startsWith(`${monthKey}-`))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
      const ta = a.startTime ?? "99:99";
      const tb = b.startTime ?? "99:99";
      return ta.localeCompare(tb);
    });
}

/**
 * ホーム「近日の予定」:
 * 今日〜withinDays 日先までの予定を、日付→開始時刻の近い順で返す（最大 limit 件）。
 * 同日内は終日を先頭、その後は開始時刻順。
 */
export function selectUpcomingEvents(
  events: CalendarEvent[],
  now: Date = new Date(),
  withinDays = 14,
  limit = 10,
): CalendarEvent[] {
  return events
    .filter((e) => {
      const d = parseDateKey(e.date);
      if (!d) return false;
      const diff = differenceInCalendarDays(d, now);
      return diff >= 0 && diff <= withinDays;
    })
    .sort((a, b) => {
      // 日付(yyyy-MM-dd)は文字列比較で時系列順になる
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
      const ta = a.startTime ?? "99:99";
      const tb = b.startTime ?? "99:99";
      return ta.localeCompare(tb);
    })
    .slice(0, limit);
}
