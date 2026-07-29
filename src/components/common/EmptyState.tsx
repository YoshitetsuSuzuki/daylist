import type { ReactNode } from "react";

/** 空状態。前向きなメッセージと任意のアクションを表示。 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-surface px-6 py-10 text-center">
      {icon && <div className="mb-1 text-primary/70">{icon}</div>}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
