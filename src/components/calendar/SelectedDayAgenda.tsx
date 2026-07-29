"use client";

import type { CalendarEvent, TodoItem } from "@/types";
import { eventsForDate, todosForDate } from "@/lib/calendar/calendarGrid";
import { parseDateKey, formatJpLongDate } from "@/lib/date/dateUtils";
import { EventCard } from "@/components/events/EventCard";
import { TodoCard } from "@/components/todos/TodoCard";
import { Button } from "@/components/common/Button";
import { CalendarPlus } from "lucide-react";

/**
 * 選択中の日の予定・やること一覧。カレンダー画面下部で使用。
 */
export function SelectedDayAgenda({
  dateKey,
  events,
  todos,
  onOpenEvent,
  onOpenTodo,
  onToggleTodo,
  onAddEvent,
  getTodo,
}: {
  dateKey: string;
  events: CalendarEvent[];
  todos: TodoItem[];
  onOpenEvent: (e: CalendarEvent) => void;
  onOpenTodo: (t: TodoItem) => void;
  onToggleTodo: (id: string) => void;
  onAddEvent: () => void;
  getTodo: (id: string) => TodoItem | undefined;
}) {
  const date = parseDateKey(dateKey);
  const dayEvents = eventsForDate(events, dateKey);
  const dayTodos = todosForDate(todos, dateKey);
  const isEmpty = dayEvents.length === 0 && dayTodos.length === 0;

  return (
    <section aria-label="選択した日の予定" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">
          {date ? formatJpLongDate(date) : dateKey}
        </h2>
        <Button
          variant="secondary"
          onClick={onAddEvent}
          className="min-h-[36px] px-3 text-xs"
        >
          <CalendarPlus size={15} aria-hidden />
          予定を追加
        </Button>
      </div>

      {isEmpty ? (
        <p className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted">
          予定はありません
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {dayEvents.length > 0 && (
            <div className="flex flex-col gap-2">
              {dayEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onOpen={() => onOpenEvent(e)}
                  linkedCompleted={
                    e.linkedTodoId
                      ? getTodo(e.linkedTodoId)?.isCompleted
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {dayTodos.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="px-1 text-xs font-semibold text-muted">
                この日が締切のやること
              </p>
              {dayTodos.map((t) => (
                <TodoCard
                  key={t.id}
                  todo={t}
                  onToggle={() => onToggleTodo(t.id)}
                  onOpen={() => onOpenTodo(t)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
