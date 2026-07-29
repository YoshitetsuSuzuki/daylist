import { describe, it, expect, beforeEach } from "vitest";
import {
  readJson,
  writeJson,
  __resetStorageAvailabilityCache,
} from "./safeStorage";
import {
  eventRepository,
  todoRepository,
  settingsRepository,
} from "./repositories";
import { STORAGE_KEYS } from "./storageKeys";
import { makeEvent, makeTodo } from "@/lib/__tests__/fixtures";
import { parseImport } from "./importExport";

beforeEach(() => {
  localStorage.clear();
  __resetStorageAvailabilityCache();
});

describe("safeStorage", () => {
  it("書いた JSON を読める", () => {
    const res = writeJson("k", { a: 1 });
    expect(res.ok).toBe(true);
    expect(readJson("k", null)).toEqual({ a: 1 });
  });

  it("壊れた JSON は fallback を返す（クラッシュしない）", () => {
    localStorage.setItem("broken", "{not json");
    expect(readJson("broken", { safe: true })).toEqual({ safe: true });
  });

  it("存在しないキーは fallback", () => {
    expect(readJson("missing", [])).toEqual([]);
  });
});

describe("repositories", () => {
  it("events の保存・読み込み", () => {
    const events = [makeEvent({ id: "e1" })];
    eventRepository.save(events);
    expect(eventRepository.load().map((e) => e.id)).toEqual(["e1"]);
  });

  it("壊れた配列から有効な要素だけ救出する", () => {
    localStorage.setItem(
      STORAGE_KEYS.todos,
      JSON.stringify([
        makeTodo({ id: "ok" }),
        { id: "bad", title: 123 }, // 不正
        "not an object",
      ]),
    );
    const loaded = todoRepository.load();
    expect(loaded.map((t) => t.id)).toEqual(["ok"]);
  });

  it("settings が壊れていても既定値を返す", () => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ bad: true }));
    const s = settingsRepository.load();
    expect(s.weekStartsOn).toBe(0);
    expect(s.sampleDataSeeded).toBe(false);
  });
});

describe("parseImport", () => {
  it("正常な JSON を取り込む", () => {
    const bundle = {
      app: "daylist",
      version: 1,
      events: [makeEvent({ id: "e1" })],
      todos: [makeTodo({ id: "t1" })],
    };
    const r = parseImport(JSON.stringify(bundle));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.events).toHaveLength(1);
      expect(r.todos).toHaveLength(1);
    }
  });

  it("不正な JSON はエラー（既存データを壊さない）", () => {
    const r = parseImport("{ broken");
    expect(r.ok).toBe(false);
  });

  it("app が違うデータは拒否", () => {
    const r = parseImport(JSON.stringify({ app: "other", events: [] }));
    expect(r.ok).toBe(false);
  });

  it("壊れた要素は除外して救出", () => {
    const r = parseImport(
      JSON.stringify({
        events: [makeEvent({ id: "good" }), { bad: true }],
        todos: [],
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.events.map((e) => e.id)).toEqual(["good"]);
  });
});
