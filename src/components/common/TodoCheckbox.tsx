import { Check } from "lucide-react";

/** 完了チェックボタン。タップ領域を確保し、aria も付与。 */
export function TodoCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `${label} を未完了に戻す` : `${label} を完了にする`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
        checked ? "text-primary" : "text-muted hover:text-foreground"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
          checked
            ? "animate-check-pop border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface"
        }`}
      >
        {checked && <Check size={15} strokeWidth={3} aria-hidden />}
      </span>
    </button>
  );
}
