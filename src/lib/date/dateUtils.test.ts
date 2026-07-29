import { describe, it, expect } from "vitest";
import {
  parseDateKey,
  toDateKey,
  isValidDateKey,
  isValidTimeKey,
  combineDateTime,
  timeToMinutes,
} from "./dateUtils";

describe("parseDateKey / toDateKey", () => {
  it("ローカル 0:00 として解釈し、日付がずれない", () => {
    const d = parseDateKey("2026-07-29");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(6);
    expect(d!.getDate()).toBe(29);
    expect(d!.getHours()).toBe(0);
    // 往復で一致
    expect(toDateKey(d!)).toBe("2026-07-29");
  });

  it("不正な文字列は null", () => {
    expect(parseDateKey("not-a-date")).toBeNull();
    expect(parseDateKey("")).toBeNull();
    expect(parseDateKey(undefined)).toBeNull();
  });
});

describe("isValidDateKey / isValidTimeKey", () => {
  it("日付形式の検証", () => {
    expect(isValidDateKey("2026-07-29")).toBe(true);
    expect(isValidDateKey("2026-7-9")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
  });
  it("時刻形式の検証", () => {
    expect(isValidTimeKey("09:30")).toBe(true);
    expect(isValidTimeKey("24:00")).toBe(false);
    expect(isValidTimeKey("9:5")).toBe(false);
  });
});

describe("combineDateTime", () => {
  it("日付と時刻を合成", () => {
    const d = combineDateTime("2026-07-29", "15:30");
    expect(d!.getHours()).toBe(15);
    expect(d!.getMinutes()).toBe(30);
  });
  it("時刻なしは 0:00", () => {
    const d = combineDateTime("2026-07-29");
    expect(d!.getHours()).toBe(0);
  });
});

describe("timeToMinutes", () => {
  it("分に変換", () => {
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes(undefined)).toBeNull();
    expect(timeToMinutes("bad")).toBeNull();
  });
});
