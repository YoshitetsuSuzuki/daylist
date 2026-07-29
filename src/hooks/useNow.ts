"use client";

import { useEffect, useState } from "react";

/**
 * 現在時刻を返す。指定間隔で更新し、締切表示などを自動で最新に保つ。
 * SSR とのハイドレーション不一致を避けるため、初期値は固定エポックとし、
 * マウント後に実時刻へ切り替える（呼び出し側は initialized ガードと併用する想定）。
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState<Date>(() => new Date(0));

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** 時間帯に応じた挨拶 */
export function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 11) return "おはようございます";
  if (h < 17) return "こんにちは";
  return "お疲れさまです";
}
