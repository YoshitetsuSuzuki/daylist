import { isValidDateKey, isValidTimeKey, timeToMinutes } from "@/lib/date/dateUtils";

export interface EventFormValues {
  title: string;
  date: string;
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
}

export type EventErrors = Partial<{
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}>;

/** 予定フォームの検証。エラーが空なら妥当。 */
export function validateEvent(values: EventFormValues): EventErrors {
  const errors: EventErrors = {};

  if (!values.title.trim()) {
    errors.title = "タイトルを入力してください。";
  }
  if (!values.date || !isValidDateKey(values.date)) {
    errors.date = "日付を正しく入力してください。";
  }

  if (!values.isAllDay) {
    if (values.startTime && !isValidTimeKey(values.startTime)) {
      errors.startTime = "開始時刻の形式が正しくありません。";
    }
    if (values.endTime && !isValidTimeKey(values.endTime)) {
      errors.endTime = "終了時刻の形式が正しくありません。";
    }
    const start = timeToMinutes(values.startTime);
    const end = timeToMinutes(values.endTime);
    if (start !== null && end !== null && end < start) {
      errors.endTime = "終了時刻は開始時刻より後にしてください。";
    }
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
