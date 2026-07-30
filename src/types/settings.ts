/** カラーテーマの種類 */
export type ThemeKey = "indigo" | "ocean" | "forest" | "sunset" | "rose";

/** アプリ設定 */
export interface Settings {
  /** 週の開始曜日（0=日曜, 1=月曜） */
  weekStartsOn: 0 | 1;
  /** 完了済みタスクをホームに表示するか */
  showCompletedOnHome: boolean;
  /** サンプルデータを投入済みか（削除後に復活させないためのフラグ） */
  sampleDataSeeded: boolean;
  /** ホームの壁紙（圧縮済み data URL。未設定なら既定背景） */
  wallpaper?: string;
  /** 壁紙の濃さ 0.1〜1（1=そのまま濃い / 小さいほど薄い。未設定は既定値） */
  wallpaperOpacity?: number;
  /** カラーテーマ（未設定は indigo） */
  theme?: ThemeKey;
}

/** 既定のカラーテーマ */
export const DEFAULT_THEME: ThemeKey = "indigo";

/** 壁紙の濃さの既定値（現行の見た目を維持） */
export const DEFAULT_WALLPAPER_OPACITY = 0.8;

export const DEFAULT_SETTINGS: Settings = {
  weekStartsOn: 0,
  showCompletedOnHome: true,
  sampleDataSeeded: false,
};
