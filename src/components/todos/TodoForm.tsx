"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TodoItem, Category, Priority } from "@/types";
import { useAppData } from "@/context/AppDataContext";
import type { TodoInput } from "@/context/appDataTypes";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import {
  Field,
  TextInput,
  TextArea,
  CategoryPicker,
  PriorityPicker,
} from "@/components/common/FormFields";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PhotoAttach } from "@/components/common/PhotoAttach";
import { DEFAULT_CATEGORY } from "@/lib/constants/categories";
import { DEFAULT_PRIORITY } from "@/lib/constants/priorities";
import { validateTodo } from "@/lib/validation/todoValidation";
import { hasErrors } from "@/lib/validation/eventValidation";
import { CalendarClock, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  todo?: TodoItem | null;
  defaultDate?: string;
}

export function TodoForm({ open, onClose, todo, defaultDate }: Props) {
  const { addTodo, editTodo, removeTodo, getEvent } = useAppData();
  const isEdit = !!todo;
  const formId = useId();
  const submittingRef = useRef(false);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [category, setCategory] = useState<Category>(DEFAULT_CATEGORY);
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    submittingRef.current = false;
    setErrors({});
    setConfirmDelete(false);
    if (todo) {
      setTitle(todo.title);
      setDueDate(todo.dueDate ?? "");
      setDueTime(todo.dueTime ?? "");
      setCategory(todo.category);
      setPriority(todo.priority);
      setMemo(todo.memo ?? "");
      setPhotos(todo.photos ?? []);
    } else {
      setTitle("");
      setDueDate(defaultDate ?? "");
      setDueTime("");
      setCategory(DEFAULT_CATEGORY);
      setPriority(DEFAULT_PRIORITY);
      setMemo("");
      setPhotos([]);
    }
  }, [open, todo, defaultDate]);

  const handleSubmit = () => {
    if (submittingRef.current) return;
    const nextErrors = validateTodo({
      title,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    submittingRef.current = true;
    const input: TodoInput = {
      title,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      category,
      priority,
      memo: memo || undefined,
      photos,
    };
    if (isEdit && todo) {
      editTodo(todo.id, input);
    } else {
      addTodo(input);
    }
    onClose();
  };

  const linkedEvent = todo?.eventId ? getEvent(todo.eventId) : undefined;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={isEdit ? "やることを編集" : "やることを追加"}
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
              placeholder="例：レポートを提出する"
              error={!!errors.title}
              maxLength={100}
            />
          </Field>

          {linkedEvent && (
            <div className="flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-xs text-primary">
              <CalendarClock size={14} aria-hidden />
              予定「{linkedEvent.title}」に紐づいています
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="締切日（任意）"
              htmlFor={`${formId}-dd`}
              error={errors.dueDate}
            >
              <TextInput
                id={`${formId}-dd`}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                error={!!errors.dueDate}
              />
            </Field>
            <Field
              label="締切時刻（任意）"
              htmlFor={`${formId}-dt`}
              error={errors.dueTime}
            >
              <TextInput
                id={`${formId}-dt`}
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                error={!!errors.dueTime}
              />
            </Field>
          </div>

          <Field label="カテゴリー">
            <CategoryPicker value={category} onChange={setCategory} />
          </Field>

          <Field label="優先度">
            <PriorityPicker value={priority} onChange={setPriority} />
          </Field>

          <Field label="メモ（任意）" htmlFor={`${formId}-memo`}>
            <TextArea
              id={`${formId}-memo`}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="詳細・補足"
            />
          </Field>

          <Field label="写真（任意）">
            <PhotoAttach value={photos} onChange={setPhotos} />
          </Field>

          {isEdit && (
            <div className="mt-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-danger hover:underline"
              >
                <Trash2 size={16} aria-hidden />
                このやることを削除
              </button>
              {linkedEvent && (
                <p className="mt-1 text-xs text-muted">
                  ※ やることを削除しても、紐づく予定は削除されません。
                </p>
              )}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="このやることを削除しますか？"
        message="この操作は取り消せません。"
        choices={[
          {
            label: "削除する",
            variant: "danger",
            onSelect: () => {
              if (todo) removeTodo(todo.id);
              setConfirmDelete(false);
              onClose();
            },
          },
        ]}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
