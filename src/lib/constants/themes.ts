import type { ThemeKey } from "@/types";

export interface ThemeConfig {
  key: ThemeKey;
  label: string;
  /** ピッカーのスウォッチ色（＝そのテーマの主要色） */
  color: string;
}

/**
 * カラーテーマ定義（唯一の情報源）。
 * 実際の色は globals.css の [data-theme="..."] で CSS 変数を上書きする。
 * ここはピッカー表示用のラベルとスウォッチ色のみ。
 */
export const THEMES: ThemeConfig[] = [
  { key: "indigo", label: "インディゴ", color: "#4f6bed" },
  { key: "ocean", label: "オーシャン", color: "#0ea5a5" },
  { key: "forest", label: "フォレスト", color: "#3f9d5f" },
  { key: "sunset", label: "サンセット", color: "#e07a4f" },
  { key: "rose", label: "ローズ", color: "#db5a86" },
];
