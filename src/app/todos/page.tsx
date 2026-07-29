"use client";

import { useMemo, useState } from "react";
import type { TodoItem } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import { useNow } from "@/hooks/useNow";
import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { SearchInput } from "@/components/common/SearchInput";
import { TodoCard } from "@/components/todos/TodoCard";
import { TodoForm } from "@/components/todos/TodoForm";
import { EmptyState } from "@/components/common/EmptyState";
import {
  FilterPanel,
  DEFAULT_FILTER,
  isFilterActive,
  type TodoFilter,
} from "@/components/todos/FilterPanel";
import {
  applyTab,
  applySearch,
  applyFilter,
  type TodoTab,
} from "@/lib/selectors/todoFilters";
import { sortTodosForList } from "@/lib/selectors/todoSelectors";
import { SlidersHorizontal, ListChecks } from "lucide-react";

const TABS: { key: TodoTab; label: string }[] = [
  { key: "active", label: "未完了" },
  { key: "completed", label: "完了済み" },
  { key: "all", label: "すべて" },
];

export default function TodosPage() {
  const { data, toggleTodoCompleted } = useAppData();
  const now = useNow();
  const { todos, initialized } = data;

  const [tab, setTab] = useState<TodoTab>("active");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TodoFilter>(DEFAULT_FILTER);
  const [showFilter, setShowFilter] = useState(false);
  const [editing, setEditing] = useState<TodoItem | null>(null);

  const visible = useMemo(() => {
    let list = applyTab(todos, tab);
    list = applySearch(list, query);
    list = applyFilter(list, filter, now);
    return sortTodosForList(list, now);
  }, [todos, tab, query, filter, now]);

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  const filterActive = isFilterActive(filter);

  return (
    <div className="space-y-4">
      <AppHeader title="やること" />

      {/* タブ */}
      <div
        role="tablist"
        aria-label="表示切り替え"
        className="flex gap-1 rounded-xl bg-surface-muted p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`min-h-[40px] flex-1 rounded-lg text-sm font-semibold transition ${
              tab === t.key
                ? "bg-surface text-foreground shadow-card"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 検索 & 絞り込み */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="タイトル・メモ・カテゴリーで検索"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilter((v) => !v)}
          aria-expanded={showFilter}
          aria-label="絞り込み"
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
            showFilter || filterActive
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-surface text-muted hover:bg-surface-muted"
          }`}
        >
          <SlidersHorizontal size={18} aria-hidden />
          {filterActive && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {showFilter && (
        <FilterPanel
          filter={filter}
          onChange={setFilter}
          onReset={() => setFilter(DEFAULT_FILTER)}
        />
      )}

      {/* 一覧 */}
      {visible.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={28} aria-hidden />}
          title={
            query || filterActive
              ? "条件に合うやることがありません"
              : tab === "completed"
                ? "完了したやることはまだありません"
                : "やることはありません"
          }
          description={
            query || filterActive
              ? "検索条件や絞り込みを変えてみましょう。"
              : "右下の＋から追加できます。"
          }
        />
      ) : (
        <div className="space-y-2">
          {visible.map((t) => (
            <TodoCard
              key={t.id}
              todo={t}
              now={now}
              onToggle={() => toggleTodoCompleted(t.id)}
              onOpen={() => setEditing(t)}
            />
          ))}
        </div>
      )}

      <TodoForm
        open={!!editing}
        onClose={() => setEditing(null)}
        todo={editing}
      />
    </div>
  );
}
