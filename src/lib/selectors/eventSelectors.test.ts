import { describe, it, expect } from "vitest";
import { selectUpcomingEvents } from "./eventSelectors";
import { makeEvent, NOW } from "@/lib/__tests__/fixtures";

describe("selectUpcomingEvents", () => {
  it("今日〜2週間先の予定を日付の近い順で返す", () => {
    const events = [
      makeEvent({ id: "far", date: "2026-08-30" }), // 2週間超
      makeEvent({ id: "d5", date: "2026-08-03" }),
      makeEvent({ id: "today", date: "2026-07-29", startTime: "10:00" }),
      makeEvent({ id: "past", date: "2026-07-20" }), // 過去
    ];
    const result = selectUpcomingEvents(events, NOW, 14);
    expect(result.map((e) => e.id)).toEqual(["today", "d5"]);
  });

  it("同日内は終日を先頭、その後は開始時刻の早い順", () => {
    const events = [
      makeEvent({ id: "pm", date: "2026-07-29", startTime: "15:00" }),
      makeEvent({ id: "allday", date: "2026-07-29", isAllDay: true }),
      makeEvent({ id: "am", date: "2026-07-29", startTime: "09:00" }),
    ];
    const result = selectUpcomingEvents(events, NOW, 14);
    expect(result.map((e) => e.id)).toEqual(["allday", "am", "pm"]);
  });

  it("最大件数(limit)で打ち切る", () => {
    const events = Array.from({ length: 15 }, (_, i) =>
      makeEvent({ id: `e${i}`, date: "2026-07-30", startTime: `${String(i).padStart(2, "0")}:00` }),
    );
    const result = selectUpcomingEvents(events, NOW, 14, 10);
    expect(result).toHaveLength(10);
  });
});
