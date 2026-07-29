import { describe, it, expect } from "vitest";
import {
  getDeadlineState,
  formatDeadlineLabel,
  isOverdue,
  deadlineSortValue,
} from "./deadlineUtils";
import { makeTodo, NOW } from "@/lib/__tests__/fixtures";

describe("getDeadlineState", () => {
  it("締切なしは none", () => {
    expect(getDeadlineState(makeTodo({ dueDate: undefined }), NOW)).toBe("none");
  });

  it("昨日締切は overdue", () => {
    expect(getDeadlineState(makeTodo({ dueDate: "2026-07-28" }), NOW)).toBe(
      "overdue",
    );
  });

  it("今日締切（時刻なし）は today", () => {
    expect(getDeadlineState(makeTodo({ dueDate: "2026-07-29" }), NOW)).toBe(
      "today",
    );
  });

  it("今日締切だが時刻が過ぎていれば overdue", () => {
    // NOW=12:00。11:00 締切は過ぎている
    expect(
      getDeadlineState(makeTodo({ dueDate: "2026-07-29", dueTime: "11:00" }), NOW),
    ).toBe("overdue");
  });

  it("今日締切で時刻が未来なら today", () => {
    expect(
      getDeadlineState(makeTodo({ dueDate: "2026-07-29", dueTime: "18:00" }), NOW),
    ).toBe("today");
  });

  it("明日は tomorrow", () => {
    expect(getDeadlineState(makeTodo({ dueDate: "2026-07-30" }), NOW)).toBe(
      "tomorrow",
    );
  });

  it("7日以内は soon、8日以降は future", () => {
    expect(getDeadlineState(makeTodo({ dueDate: "2026-08-04" }), NOW)).toBe(
      "soon",
    );
    expect(getDeadlineState(makeTodo({ dueDate: "2026-08-30" }), NOW)).toBe(
      "future",
    );
  });
});

describe("formatDeadlineLabel", () => {
  it("今日 15:00 / 明日 / 日付 / 期限切れ / 締切なし", () => {
    expect(
      formatDeadlineLabel(makeTodo({ dueDate: "2026-07-29", dueTime: "15:00" }), NOW),
    ).toBe("今日 15:00");
    expect(formatDeadlineLabel(makeTodo({ dueDate: "2026-07-30" }), NOW)).toBe(
      "明日",
    );
    expect(formatDeadlineLabel(makeTodo({ dueDate: "2026-07-31" }), NOW)).toBe(
      "7月31日",
    );
    expect(formatDeadlineLabel(makeTodo({ dueDate: "2026-07-28" }), NOW)).toBe(
      "期限切れ",
    );
    expect(formatDeadlineLabel(makeTodo({ dueDate: undefined }), NOW)).toBe(
      "締切なし",
    );
  });
});

describe("isOverdue", () => {
  it("完了済みは overdue にならない", () => {
    expect(
      isOverdue(makeTodo({ dueDate: "2026-07-01", isCompleted: true }), NOW),
    ).toBe(false);
  });
});

describe("deadlineSortValue", () => {
  it("締切なしは最大値", () => {
    expect(deadlineSortValue(makeTodo({ dueDate: undefined }))).toBe(
      Number.MAX_SAFE_INTEGER,
    );
  });
  it("早い締切の方が小さい", () => {
    const a = deadlineSortValue(makeTodo({ dueDate: "2026-07-29", dueTime: "09:00" }));
    const b = deadlineSortValue(makeTodo({ dueDate: "2026-07-29", dueTime: "18:00" }));
    expect(a).toBeLessThan(b);
  });
});
