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
import { TodoCard } from "@/components/todos/TodoCard";
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

export default function HomePage() {
  const router = useRouter();
  const { data, toggleTodoCompleted, setSelectedDate, setViewMonth } =
    useAppData();
  const now = useNow();
  const [editing, setEditing] = useState<TodoItem | null>(null);

  const { events, todos, settings, initialized } = data;

  const todayTodos = useMemo(
    () => selectTodayTodos(todos, events, now, settings.showCompletedOnHome),
    [todos, events, now, settings.showCompletedOnHome],
  );
  const overdue = useMemo(() => selectOverdueTodos(todos, now), [todos, now]);
  const upcoming = useMemo(() => {
    // 今日ちょうどのものは「今日やること」に出るため、明日以降〜7日を近接として出す
    return selectUpcomingTodos(todos, now).filter((t) => t.dueDate !== todayKeyOf(now));
  }, [todos, now]);

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  const remaining = countActive(todayTodos);
  const nothingToday = todayTodos.filter((t) => !t.isCompleted).length === 0;
  const nothingUpcoming = overdue.length === 0 && upcoming.length === 0;

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

          {/* 今日やること */}
          <section aria-label="今日やること" className="space-y-2">
            <h2 className="px-1 text-sm font-bold">今日やること</h2>
            {nothingToday && todayTodos.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={28} aria-hidden />}
                title="今日のやることはありません"
                description="新しい予定やタスクを追加してみましょう。右下の＋から追加できます。"
              />
            ) : (
              <div className="space-y-2">
                {todayTodos.map((t) => (
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
          </section>

          {/* 期限が近いやること */}
          {upcoming.length > 0 && (
            <section aria-label="期限が近いやること" className="space-y-2">
              <h2 className="px-1 text-sm font-bold">期限が近いやること</h2>
              <div className="space-y-2">
                {upcoming.map((t) => (
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

          {nothingToday && nothingUpcoming && todayTodos.length === 0 && (
            <p className="px-1 text-sm text-muted">
              直近の締切はありません。良いペースです。
            </p>
          )}
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

// 日付キー（now と同じ基準）を得る小さなヘルパー（selectors 経由の import 循環を避ける）
function todayKeyOf(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
