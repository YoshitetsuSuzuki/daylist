"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare } from "lucide-react";

// カレンダーはホーム画面に常設のため、下タブは「ホーム」「やること」の2つに絞る。
const items = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/todos", label: "やること", icon: CheckSquare },
];

/** モバイル画面下部の主要ナビ。現在地を色とテキスト、aria-current で明示。 */
export function BottomNavigation() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
