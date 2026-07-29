import { describe, it, expect } from "vitest";
import {
  buildMonthGrid,
  buildDayMarkers,
  eventsForDate,
  todosForDate,
} from "./calendarGrid";
import { makeEvent, makeTodo } from "@/lib/__tests__/fixtures";

describe("buildMonthGrid", () => {
  it("日曜始まりで先頭が日曜、7の倍数セルになる", () => {
    // 2026-07 は 7/1 が水曜
    const july = new Date(2026, 6, 15);
    const cells = buildMonthGrid(july, 0, new Date(2026, 6, 29));
    expect(cells.length % 7).toBe(0);
    expect(cells[0].date.getDay()).toBe(0); // 日曜
    // 先頭は前月(6月)の日付で inMonth=false
    expect(cells[0].inMonth).toBe(false);
    // 今日フラグ
    const today = cells.find((c) => c.dateKey === "2026-07-29");
    expect(today?.isToday).toBe(true);
  });

  it("月曜始まりで先頭が月曜", () => {
    const july = new Date(2026, 6, 15);
    const cells = buildMonthGrid(july, 1, new Date(2026, 6, 29));
    expect(cells[0].date.getDay()).toBe(1);
  });

  it("当月の全日を含む", () => {
    const july = new Date(2026, 6, 15);
    const cells = buildMonthGrid(july, 0, new Date(2026, 6, 29));
    const inMonthDays = cells.filter((c) => c.inMonth).length;
    expect(inMonthDays).toBe(31); // 7月は31日
  });
});

describe("buildDayMarkers", () => {
  it("予定カテゴリーと ToDo 有無を日付ごとに集約", () => {
    const events = [
      makeEvent({ date: "2026-07-29", category: "work" }),
      makeEvent({ date: "2026-07-29", category: "study" }),
      makeEvent({ date: "2026-07-29", category: "work" }), // 重複カテゴリーは1つに
    ];
    const todos = [makeTodo({ dueDate: "2026-07-30" })];
    const markers = buildDayMarkers(events, todos);
    expect(markers.get("2026-07-29")?.eventCategories.sort()).toEqual([
      "study",
      "work",
    ]);
    expect(markers.get("2026-07-29")?.hasTodo).toBe(false);
    expect(markers.get("2026-07-30")?.hasTodo).toBe(true);
  });
});

describe("eventsForDate", () => {
  it("終日を先頭、その後は開始時刻順", () => {
    const events = [
      makeEvent({ id: "b", date: "2026-07-29", startTime: "13:00" }),
      makeEvent({ id: "allday", date: "2026-07-29", isAllDay: true }),
      makeEvent({ id: "a", date: "2026-07-29", startTime: "09:00" }),
      makeEvent({ id: "other", date: "2026-07-30", startTime: "08:00" }),
    ];
    const result = eventsForDate(events, "2026-07-29");
    expect(result.map((e) => e.id)).toEqual(["allday", "a", "b"]);
  });
});

describe("todosForDate", () => {
  it("その日が締切の ToDo のみ", () => {
    const todos = [
      makeTodo({ id: "x", dueDate: "2026-07-29" }),
      makeTodo({ id: "y", dueDate: "2026-07-30" }),
    ];
    expect(todosForDate(todos, "2026-07-29").map((t) => t.id)).toEqual(["x"]);
  });
});
