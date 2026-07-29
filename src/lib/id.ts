/**
 * 重複しない ID を生成する。
 * crypto.randomUUID が使える環境ではそれを使い、無い場合はフォールバック。
 */
export function generateId(prefix = "id"): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch {
    // crypto 未対応環境はフォールバックへ
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}
