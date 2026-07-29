"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TodoItem } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import { useNow, greetingFor } from "@/hooks/useNow";
import {
  selectTodayTodos,
  selectUpcomingTodos,
  selectOverdueTodos,
  countActive,
} from "@/lib/selectors/todoSelectors";
import { formatJpLongDate } from "@/lib/date/dateUtils";
import { getDeadlineState } from "@/lib/date/deadlineUtils";
import { TodoCard } from "@/components/todos/TodoCard";
import { UpcomingTodoRow } from "@/components/todos/UpcomingTodoRow";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { TodoForm } from "@/components/todos/TodoForm";
import { Button } from "@/components/common/Button";
import {
  CalendarDays,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Settings as SettingsIcon,
} from "lucide-react";

// 近日のやること：今日を含めて向こう 2 週間、最大 10 件
const UPCOMING_DAYS = 14;
const UPCOMING_LIMIT = 10;

export default function HomePage() {
  const router = useRouter();
  const { data, toggleTodoCompleted, setSelectedDate, setViewMonth } =
    useAppData();
  const now = useNow();
  const [editing, setEditing] = useState<TodoItem | null>(null);

  const { events, todos, settings, initialized } = data;

  // ヘッダーの「残り N 件」用：今日のやること
  const todayTodos = useMemo(
    () => selectTodayTodos(todos, events, now, settings.showCompletedOnHome),
    [todos, events, now, settings.showCompletedOnHome],
  );
  const overdue = useMemo(() => selectOverdueTodos(todos, now), [todos, now]);
  // 締切が近い順に、今日〜2週間先まで／最大10件（期限切れは上の別枠に出すため除外）
  const upcoming = useMemo(
    () =>
      selectUpcomingTodos(todos, now, UPCOMING_DAYS)
        .filter((t) => getDeadlineState(t, now) !== "overdue")
        .slice(0, UPCOMING_LIMIT),
    [todos, now],
  );

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  const remaining = countActive(todayTodos);

  const openDay = (dateKey: string) => {
    setSelectedDate(dateKey);
    router.push("/calendar");
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <header className="flex items-start justify-between gap-3 pt-1">
        <div>
          <p className="text-sm font-medium text-muted">
            {formatJpLongDate(now)}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
            {greetingFor(now)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {remaining > 0 ? (
              <>
                今日のやること、残り
                <span className="font-bold text-primary"> {remaining} </span>件
              </>
            ) : (
              "今日も少しずつ進めましょう"
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/settings")}
          aria-label="設定を開く"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-muted"
        >
          <SettingsIcon size={20} aria-hidden />
        </button>
      </header>

      {/* PC では2カラム、モバイルは1カラム */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {/* 期限切れ（あれば最上部） */}
          {overdue.length > 0 && (
            <section aria-label="期限切れのやること" className="space-y-2">
              <h2 className="flex items-center gap-1.5 px-1 text-sm font-bold text-danger">
                <AlertTriangle size={16} aria-hidden />
                期限切れ（{overdue.length}）
              </h2>
              <div className="space-y-2">
                {overdue.map((t) => (
                  <TodoCard
                    key={t.id}
                    todo={t}
                    now={now}
                    onToggle={() => toggleTodoCompleted(t.id)}
                    onOpen={() => setEditing(t)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 近日のやること（締切が近い順・今日〜2週間先／最大10件） */}
          <section aria-label="近日のやること" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-bold">近日のやること</h2>
              <span className="text-xs text-muted">締切が近い順</span>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={28} aria-hidden />}
                title="近日のやることはありません"
                description="新しい予定やタスクを追加してみましょう。右下の＋から追加できます。"
              />
            ) : (
              <ul className="space-y-1.5">
                {upcoming.map((t) => (
                  <li key={t.id}>
                    <UpcomingTodoRow
                      todo={t}
                      onToggle={() => toggleTodoCompleted(t.id)}
                      onOpen={() => setEditing(t)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ミニカレンダー */}
        <div className="space-y-3">
          <section aria-label="今月のカレンダー" className="space-y-2">
            <MonthlyCalendar
              viewMonth={data.viewMonth}
              selectedDate={data.selectedDate}
              events={events}
              todos={todos}
              weekStartsOn={settings.weekStartsOn}
              onSelectDate={openDay}
              onChangeMonth={setViewMonth}
            />
            <Button
              variant="secondary"
              onClick={() => router.push("/calendar")}
              className="w-full"
            >
              <CalendarDays size={18} aria-hidden />
              カレンダーを開く
              <ArrowRight size={16} aria-hidden />
            </Button>
          </section>
        </div>
      </div>

      <TodoForm
        open={!!editing}
        onClose={() => setEditing(null)}
        todo={editing}
      />
    </div>
  );
}

