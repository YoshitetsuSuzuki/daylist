import type { Category } from "@/types";
import {
  Briefcase,
  BookOpen,
  User,
  HeartPulse,
  ShoppingCart,
  Tag,
  type LucideIcon,
} from "lucide-react";

export interface CategoryConfig {
  key: Category;
  label: string;
  icon: LucideIcon;
  /** ドット/バッジ用の色（落ち着いた配色） */
  color: string;
  /** バッジ背景（薄色） */
  softBg: string;
  softText: string;
}

/**
 * カテゴリー定義（唯一の情報源）。
 * 将来ユーザーが追加・編集できるよう、UI からはこの配列/マップを参照する。
 */
export const CATEGORIES: CategoryConfig[] = [
  {
    key: "work",
    label: "仕事",
    icon: Briefcase,
    color: "#4f6bed",
    softBg: "#eef1fd",
    softText: "#3a51c4",
  },
  {
    key: "study",
    label: "勉強",
    icon: BookOpen,
    color: "#3f9d8f",
    softBg: "#e7f5f2",
    softText: "#2e7d70",
  },
  {
    key: "personal",
    label: "プライベート",
    icon: User,
    color: "#b07cc6",
    softBg: "#f4edf7",
    softText: "#8a56a3",
  },
  {
    key: "health",
    label: "健康",
    icon: HeartPulse,
    color: "#e0876a",
    softBg: "#fbeee8",
    softText: "#c26545",
  },
  {
    key: "shopping",
    label: "買い物",
    icon: ShoppingCart,
    color: "#d4a13c",
    softBg: "#faf2e0",
    softText: "#a97d24",
  },
  {
    key: "other",
    label: "その他",
    icon: Tag,
    color: "#8b93a3",
    softBg: "#eef0f3",
    softText: "#5f6675",
  },
];

export const CATEGORY_MAP: Record<Category, CategoryConfig> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.key] = c;
    return acc;
  },
  {} as Record<Category, CategoryConfig>,
);

export const DEFAULT_CATEGORY: Category = "personal";

export function getCategory(key: Category): CategoryConfig {
  return CATEGORY_MAP[key] ?? CATEGORY_MAP.other;
}
