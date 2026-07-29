/** アプリ設定 */
export interface Settings {
  /** 週の開始曜日（0=日曜, 1=月曜） */
  weekStartsOn: 0 | 1;
  /** 完了済みタスクをホームに表示するか */
  showCompletedOnHome: boolean;
  /** サンプルデータを投入済みか（削除後に復活させないためのフラグ） */
  sampleDataSeeded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  weekStartsOn: 0,
  showCompletedOnHome: true,
  sampleDataSeeded: false,
};
