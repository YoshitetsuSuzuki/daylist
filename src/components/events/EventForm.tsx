"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CalendarEvent, Category, Priority } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import type { EventInput } from "@/context/appDataTypes";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import {
  Field,
  TextInput,
  TextArea,
  Toggle,
  CategoryPicker,
  PriorityPicker,
} from "@/components/common/FormFields";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DEFAULT_CATEGORY } from "@/lib/constants/categories";
import { DEFAULT_PRIORITY } from "@/lib/constants/priorities";
import { validateEvent, hasErrors } from "@/lib/validation/eventValidation";
import { todayKey } from "@/lib/date/dateUtils";
import { Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  /** 編集対象。未指定なら新規作成 */
  event?: CalendarEvent | null;
  /** 新規作成時の初期日付 */
  defaultDate?: string;
}

const COLOR_SWATCHES = [
  "",
  "#4f6bed",
  "#3f9d8f",
  "#b07cc6",
  "#e0876a",
  "#d4a13c",
];

export function EventForm({ open, onClose, event, defaultDate }: Props) {
  const { addEvent, updateEvent, deleteEvent, getTodo } = useAppData();
  const isEdit = !!event;
  const formId = useId();
  const submittingRef = useRef(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");
  const [color, setColor] = useState("");
  const [addTodo, setAddTodo] = useState(false);
  const [todoDueDate, setTodoDueDate] = useState("");
  const [todoDueTime, setTodoDueTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 開くたびに初期化
  useEffect(() => {
    if (!open) return;
    submittingRef.current = false;
    setErrors({});
    setConfirmDelete(false);
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setIsAllDay(event.isAllDay);
      setStartTime(event.startTime ?? "");
      setEndTime(event.endTime ?? "");
      setCategory(event.category);
      setPriority(event.priority);
      setLocation(event.location ?? "");
      setMemo(event.memo ?? "");
      setColor(event.color ?? "");
      const linked = event.linkedTodoId ? getTodo(event.linkedTodoId) : undefined;
      setAddTodo(!!linked);
      setTodoDueDate(linked?.dueDate ?? "");
      setTodoDueTime(linked?.dueTime ?? "");
    } else {
      const d = defaultDate || todayKey();
      setTitle("");
      setDate(d);
      setIsAllDay(false);
      setStartTime("");
      setEndTime("");
      setCategory(DEFAULT_CATEGORY);
      setPriority(DEFAULT_PRIORITY);
      setLocation("");
      setMemo("");
      setColor("");
      setAddTodo(false);
      setTodoDueDate(d);
      setTodoDueTime("");
    }
  }, [open, event, defaultDate, getTodo]);

  const handleSubmit = () => {
    if (submittingRef.current) return; // 連打による重複登録を防ぐ
    const nextErrors = validateEvent({
      title,
      date,
      isAllDay,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    submittingRef.current = true;
    const input: EventInput = {
      title,
      date,
      isAllDay,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      category,
      priority,
      location: location || undefined,
      memo: memo || undefined,
      color: color || undefined,
      addTodo,
      todoDueDate: addTodo ? todoDueDate || date : undefined,
      todoDueTime: addTodo ? todoDueTime || undefined : undefined,
    };

    if (isEdit && event) {
      updateEvent(event.id, input);
    } else {
      addEvent(input);
    }
    onClose();
  };

  const linkedTodoExists = !!event?.linkedTodoId && !!getTodo(event.linkedTodoId);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "予定を編集" : "予定を追加"}
        footer={
          <Button
            type="button"
            onClick={handleSubmit}
            className="min-h-[36px] px-3"
          >
            保存
          </Button>
        }
      >
        <form
          id={formId}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <Field label="タイトル" htmlFor={`${formId}-title`} error={errors.title}>
            <TextInput
              id={`${formId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：英語プレゼン"
              error={!!errors.title}
              maxLength={100}
            />
          </Field>

          <Field label="日付" htmlFor={`${formId}-date`} error={errors.date}>
            <TextInput
              id={`${formId}-date`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={!!errors.date}
            />
          </Field>

          <Toggle label="終日" checked={isAllDay} onChange={setIsAllDay} />

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="開始時刻"
                htmlFor={`${formId}-start`}
                error={errors.startTime}
              >
                <TextInput
                  id={`${formId}-start`}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  error={!!errors.startTime}
                />
              </Field>
              <Field
                label="終了時刻"
                htmlFor={`${formId}-end`}
                error={errors.endTime}
              >
                <TextInput
                  id={`${formId}-end`}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  error={!!errors.endTime}
                />
              </Field>
            </div>
          )}

          {/* 場所・メモは時間の下、カテゴリーの上に配置 */}
          <Field label="場所（任意）" htmlFor={`${formId}-loc`}>
            <TextInput
              id={`${formId}-loc`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例：3号館 201教室"
            />
          </Field>

          <Field label="メモ（任意）" htmlFor={`${formId}-memo`}>
            <TextArea
              id={`${formId}-memo`}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="持ち物・準備など"
            />
          </Field>

          <Field label="カテゴリー">
            <CategoryPicker value={category} onChange={setCategory} />
          </Field>

          <Field label="優先度">
            <PriorityPicker value={priority} onChange={setPriority} />
          </Field>

          <Field label="色（任意）">
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((c) => {
                const active = color === c;
                return (
                  <button
                    key={c || "none"}
                    type="button"
                    aria-label={c ? `色 ${c}` : "色なし"}
                    aria-pressed={active}
                    onClick={() => setColor(c)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                      active ? "border-foreground" : "border-transparent"
                    }`}
                  >
                    <span
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ backgroundColor: c || "transparent" }}
                    >
                      {!c && (
                        <span className="text-[10px] text-muted">無</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="rounded-xl border border-border bg-surface-muted/50 p-3">
            <Toggle
              label="やることリストに追加する"
              checked={addTodo}
              onChange={setAddTodo}
            />
            {addTodo && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="やることの締切日" htmlFor={`${formId}-tdd`}>
                  <TextInput
                    id={`${formId}-tdd`}
                    type="date"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                  />
                </Field>
                <Field label="締切時刻" htmlFor={`${formId}-tdt`}>
                  <TextInput
                    id={`${formId}-tdt`}
                    type="time"
                    value={todoDueTime}
                    onChange={(e) => setTodoDueTime(e.target.value)}
                  />
                </Field>
                {isEdit && !linkedTodoExists && (
                  <p className="col-span-2 text-xs text-muted">
                    保存すると、この予定に紐づくやることを新しく作成します。
                  </p>
                )}
              </div>
            )}
          </div>

          {isEdit && (
            <div className="mt-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-danger hover:underline"
              >
                <Trash2 size={16} aria-hidden />
                この予定を削除
              </button>
            </div>
          )}
        </form>
      </Modal>

      {/* 削除確認：紐づく ToDo がある場合は3択 */}
      <ConfirmDialog
        open={confirmDelete}
        title="この予定を削除しますか？"
        message={
          linkedTodoExists
            ? "この予定には「やること」が紐づいています。どうしますか？"
            : "この操作は取り消せません。"
        }
        choices={
          linkedTodoExists
            ? [
                {
                  label: "予定だけ削除",
                  variant: "secondary",
                  onSelect: () => {
                    if (event) deleteEvent(event.id, "event-only");
                    setConfirmDelete(false);
                    onClose();
                  },
                },
                {
                  label: "予定と紐づくやることを削除",
                  variant: "danger",
                  onSelect: () => {
                    if (event) deleteEvent(event.id, "event-and-todo");
                    setConfirmDelete(false);
                    onClose();
                  },
                },
              ]
            : [
                {
                  label: "削除する",
                  variant: "danger",
                  onSelect: () => {
                    if (event) deleteEvent(event.id, "event-only");
                    setConfirmDelete(false);
                    onClose();
                  },
                },
              ]
        }
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
