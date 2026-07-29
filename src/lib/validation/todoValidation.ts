import { isValidDateKey, isValidTimeKey } from "@/lib/date/dateUtils";

export interface TodoFormValues {
  title: string;
  dueDate?: string;
  dueTime?: string;
}

export type TodoErrors = Partial<{
  title: string;
  dueDate: string;
  dueTime: string;
}>;

/** ToDo フォームの検証。締切は任意（未設定でも保存可能）。 */
export function validateTodo(values: TodoFormValues): TodoErrors {
  const errors: TodoErrors = {};

  if (!values.title.trim()) {
    errors.title = "タイトルを入力してください。";
  }
  if (values.dueDate && !isValidDateKey(values.dueDate)) {
    errors.dueDate = "締切日の形式が正しくありません。";
  }
  if (values.dueTime) {
    if (!isValidTimeKey(values.dueTime)) {
      errors.dueTime = "締切時刻の形式が正しくありません。";
    } else if (!values.dueDate) {
      errors.dueTime = "締切時刻を使うには締切日を設定してください。";
    }
  }

  return errors;
}
