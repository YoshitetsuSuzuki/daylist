"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TodoItem, CalendarEvent } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import { useNow } from "@/hooks/useNow";
import {
  selectTodayTodos,
  selectUpcomingTodos,
  selectOverdueTodos,
  countActive,
} from "@/lib/selectors/todoSelectors";
import {
  selectUpcomingEvents,
  selectEventsInMonth,
} from "@/lib/selectors/eventSelectors";
import { formatJpLongDate } from "@/lib/date/dateUtils";
import { getDeadlineState } from "@/lib/date/deadlineUtils";
import { TodoCard } from "@/components/todos/TodoCard";
import { UpcomingTodoRow } from "@/components/todos/UpcomingTodoRow";
import { UpcomingEventRow } from "@/components/events/UpcomingEventRow";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { TodoForm } from "@/components/todos/TodoForm";
import { EventForm } from "@/components/events/EventForm";
import { Button } from "@/components/common/Button";
import {
  Sparkles,
  AlertTriangle,
  CalendarPlus,
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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  // 予定追加（ページ遷移せずその場で開く）
  const [createEventOpen, setCreateEventOpen] = useState(false);

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
  // 開始が近い順に、今日〜2週間先まで／最大10件
  const upcomingEvents = useMemo(
    () => selectUpcomingEvents(events, now, UPCOMING_DAYS, UPCOMING_LIMIT),
    [events, now],
  );
  // カレンダーで表示中の月の予定（月を送ると更新）
  const monthEvents = useMemo(
    () => selectEventsInMonth(events, data.viewMonth),
    [events, data.viewMonth],
  );

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  const remaining = countActive(todayTodos);

  // 表示中の月「yyyy-MM」→ 月番号
  const monthNum = Number(data.viewMonth.slice(5, 7));
  // 予定追加時の初期日付：選択日が表示月内ならその日、そうでなければ月初
  const addDefaultDate = data.selectedDate.startsWith(data.viewMonth)
    ? data.selectedDate
    : `${data.viewMonth}-01`;

  // 日付タップ：ページ遷移せず、その日を選択（追加時の初期日付になる）
  const openDay = (dateKey: string) => {
    setSelectedDate(dateKey);
  };

  return (
    <div className="space-y-5">
      {/* ヘッダー（日付と残件数のみ・挨拶等の一言は表示しない） */}
      <header className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {formatJpLongDate(now)}
          </h1>
          {remaining > 0 && (
            <p className="mt-1 text-sm text-muted">
              今日のやること、残り
              <span className="font-bold text-primary"> {remaining} </span>件
            </p>
          )}
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

          {/* 近日の予定（開始が近い順・今日〜2週間先／最大10件） */}
          <section aria-label="近日の予定" className="space-y-2">
            <div className="flex items-baseline justify-between px-1">
              <h2 className="text-sm font-bold">近日の予定</h2>
              <span className="text-xs text-muted">日付が近い順</span>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="rounded-2xl bg-surface px-4 py-5 text-center text-sm text-muted">
                近日の予定はありません
              </p>
            ) : (
              <ul className="space-y-1.5">
                {upcomingEvents.map((e) => (
                  <li key={e.id}>
                    <UpcomingEventRow
                      event={e}
                      onOpen={() => setEditingEvent(e)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* カレンダー＋その月の予定一覧（月を送ると一覧も切り替わる。ページ遷移なし） */}
        <div className="space-y-4">
          <section aria-label="カレンダー">
            <MonthlyCalendar
              viewMonth={data.viewMonth}
              selectedDate={data.selectedDate}
              events={events}
              todos={todos}
              weekStartsOn={settings.weekStartsOn}
              onSelectDate={openDay}
              onChangeMonth={setViewMonth}
            />
          </section>

          {/* 表示中の月の予定を一覧表示 */}
          <section aria-label="この月の予定" className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold">{monthNum}月の予定</h2>
              <Button
                variant="secondary"
                onClick={() => setCreateEventOpen(true)}
                className="min-h-[36px] px-3 text-xs"
              >
                <CalendarPlus size={15} aria-hidden />
                予定を追加
              </Button>
            </div>
            {monthEvents.length === 0 ? (
              <p className="rounded-2xl bg-surface px-4 py-5 text-center text-sm text-muted">
                {monthNum}月の予定はありません
              </p>
            ) : (
              <ul className="space-y-1.5">
                {monthEvents.map((e) => (
                  <li key={e.id}>
                    <UpcomingEventRow
                      event={e}
                      onOpen={() => setEditingEvent(e)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <TodoForm
        open={!!editing}
        onClose={() => setEditing(null)}
        todo={editing}
      />
      <EventForm
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        event={editingEvent}
      />
      {/* 新規予定（表示中の月・選択日を初期値に。その場で追加・遷移なし） */}
      <EventForm
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        defaultDate={addDefaultDate}
      />
    </div>
  );
}

