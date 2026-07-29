/**
 * デプロイ先のベースパス。
 * - Vercel / Capacitor / ローカル: ルート配信のため空文字 ""
 * - GitHub Pages のプロジェクトページ: "/daylist" のようなサブパス
 *
 * next.config で GITHUB_PAGES=true のとき NEXT_PUBLIC_BASE_PATH が注入される。
 * これを唯一の情報源として、manifest・アイコン・Service Worker のパスを組み立てる。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** ベースパスを前置したパスを返す（先頭スラッシュ必須の入力を想定） */
export function withBase(path: string): string {
  return `${BASE_PATH}${path}`;
}
