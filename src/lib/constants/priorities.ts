import type { Priority } from "@/types";

export interface PriorityConfig {
  key: Priority;
  label: string;
  /** 並び替え用の重み（大きいほど高優先） */
  weight: number;
  softBg: string;
  softText: string;
  dot: string;
}

/**
 * 優先度定義（唯一の情報源）。
 * 「高」は控えめに目立たせる（強い赤は多用しない）。
 */
export const PRIORITIES: PriorityConfig[] = [
  {
    key: "low",
    label: "低",
    weight: 0,
    softBg: "#eef0f3",
    softText: "#5f6675",
    dot: "#9aa2b1",
  },
  {
    key: "medium",
    label: "中",
    weight: 1,
    softBg: "#eef1fd",
    softText: "#3a51c4",
    dot: "#4f6bed",
  },
  {
    key: "high",
    label: "高",
    weight: 2,
    softBg: "#fcefe9",
    softText: "#c05f3c",
    dot: "#e07a4f",
  },
];

export const PRIORITY_MAP: Record<Priority, PriorityConfig> = PRIORITIES.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<Priority, PriorityConfig>,
);

export const DEFAULT_PRIORITY: Priority = "medium";

export function getPriority(key: Priority): PriorityConfig {
  return PRIORITY_MAP[key] ?? PRIORITY_MAP.medium;
}

export function priorityWeight(key: Priority): number {
  return getPriority(key).weight;
}
