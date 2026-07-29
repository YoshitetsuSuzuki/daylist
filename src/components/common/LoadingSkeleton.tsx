/** 初期化前のプレースホルダ。ハイドレーション不一致を避けるための静的表示。 */
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-8 w-40 rounded-lg bg-surface-muted" />
      <div className="h-24 rounded-2xl bg-surface-muted" />
      <div className="h-24 rounded-2xl bg-surface-muted" />
      <div className="h-64 rounded-2xl bg-surface-muted" />
    </div>
  );
}
