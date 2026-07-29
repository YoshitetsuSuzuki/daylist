"use client";

import { useState } from "react";
import type { CalendarEvent, TodoItem } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { SelectedDayAgenda } from "@/components/calendar/SelectedDayAgenda";
import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EventForm } from "@/components/events/EventForm";
import { TodoForm } from "@/components/todos/TodoForm";

export default function CalendarPage() {
  const { data, setSelectedDate, setViewMonth, toggleTodoCompleted, getTodo } =
    useAppData();
  const { events, todos, settings, initialized, selectedDate, viewMonth } = data;

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <AppHeader title="カレンダー" />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyCalendar
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          events={events}
          todos={todos}
          weekStartsOn={settings.weekStartsOn}
          onSelectDate={setSelectedDate}
          onChangeMonth={setViewMonth}
        />

        <SelectedDayAgenda
          dateKey={selectedDate}
          events={events}
          todos={todos}
          getTodo={getTodo}
          onOpenEvent={(e) => setEditingEvent(e)}
          onOpenTodo={(t) => setEditingTodo(t)}
          onToggleTodo={toggleTodoCompleted}
          onAddEvent={() => setCreateEventOpen(true)}
        />
      </div>

      {/* 選択日を初期値にした新規予定 */}
      <EventForm
        open={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        defaultDate={selectedDate}
      />
      {/* 編集 */}
      <EventForm
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        event={editingEvent}
      />
      <TodoForm
        open={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        todo={editingTodo}
      />
    </div>
  );
}
