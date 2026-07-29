"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, CalendarPlus, ListPlus, X } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { EventForm } from "@/components/events/EventForm";
import { TodoForm } from "@/components/todos/TodoForm";

/**
 * 全画面共通の「＋」ボタン。予定 / やること の追加を選択できる。
 * カレンダーで日付選択中は、その日付を初期値にする（context の selectedDate）。
 */
export function FloatingAddButton() {
  const { data } = useAppData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [todoOpen, setTodoOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const defaultDate = data.selectedDate || undefined;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed right-4 z-40"
        style={{ bottom: "calc(76px + var(--safe-bottom))" }}
      >
        {menuOpen && (
          <div
            className="absolute bottom-16 right-0 flex animate-slide-up flex-col items-end gap-2"
            role="menu"
            aria-label="追加メニュー"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setEventOpen(true);
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface py-2.5 pl-4 pr-3 text-sm font-semibold shadow-pop"
            >
              予定を追加
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <CalendarPlus size={18} aria-hidden />
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setTodoOpen(true);
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-surface py-2.5 pl-4 pr-3 text-sm font-semibold shadow-pop"
            >
              やることを追加
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <ListPlus size={18} aria-hidden />
              </span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={menuOpen ? "追加メニューを閉じる" : "予定・やることを追加"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop transition-transform active:scale-95"
        >
          {menuOpen ? (
            <X size={26} aria-hidden />
          ) : (
            <Plus size={28} aria-hidden />
          )}
        </button>
      </div>

      {/* メニューを開いた時の透明オーバーレイ（外側タップで閉じる） */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      <EventForm
        open={eventOpen}
        onClose={() => setEventOpen(false)}
        defaultDate={defaultDate}
      />
      <TodoForm
        open={todoOpen}
        onClose={() => setTodoOpen(false)}
        defaultDate={defaultDate}
      />
    </>
  );
}
