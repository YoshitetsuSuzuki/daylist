import type { CalendarEvent, TodoItem, Settings, Category, Priority } from "@/types";

const CATEGORIES: Category[] = [
  "work",
  "study",
  "personal",
  "health",
  "shopping",
  "other",
];
const PRIORITIES: Priority[] = ["low", "medium", "high"];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isStr(v: unknown): v is string {
  return typeof v === "string";
}
function isOptStr(v: unknown): v is string | undefined {
  return v === undefined || typeof v === "string";
}
function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

export function isCategory(v: unknown): v is Category {
  return isStr(v) && (CATEGORIES as string[]).includes(v);
}
export function isPriority(v: unknown): v is Priority {
  return isStr(v) && (PRIORITIES as string[]).includes(v);
}

export function isCalendarEvent(v: unknown): v is CalendarEvent {
  if (!isObject(v)) return false;
  return (
    isStr(v.id) &&
    isStr(v.title) &&
    isStr(v.date) &&
    isOptStr(v.startTime) &&
    isOptStr(v.endTime) &&
    isBool(v.isAllDay) &&
    isOptStr(v.memo) &&
    isOptStr(v.location) &&
    isCategory(v.category) &&
    isPriority(v.priority) &&
    isOptStr(v.color) &&
    isOptStr(v.linkedTodoId) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt)
  );
}

export function isTodoItem(v: unknown): v is TodoItem {
  if (!isObject(v)) return false;
  return (
    isStr(v.id) &&
    isStr(v.title) &&
    isOptStr(v.dueDate) &&
    isOptStr(v.dueTime) &&
    isOptStr(v.memo) &&
    isCategory(v.category) &&
    isPriority(v.priority) &&
    isBool(v.isCompleted) &&
    isOptStr(v.completedAt) &&
    isOptStr(v.eventId) &&
    isStr(v.createdAt) &&
    isStr(v.updatedAt)
  );
}

export function isEventArray(v: unknown): v is CalendarEvent[] {
  return Array.isArray(v) && v.every(isCalendarEvent);
}
export function isTodoArray(v: unknown): v is TodoItem[] {
  return Array.isArray(v) && v.every(isTodoItem);
}

export function isSettings(v: unknown): v is Settings {
  if (!isObject(v)) return false;
  return (
    (v.weekStartsOn === 0 || v.weekStartsOn === 1) &&
    isBool(v.showCompletedOnHome) &&
    isBool(v.sampleDataSeeded)
  );
}

/** 壊れた配列でも「有効な要素だけ」を救出する（部分復旧） */
export function salvageEvents(v: unknown): CalendarEvent[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isCalendarEvent);
}
export function salvageTodos(v: unknown): TodoItem[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isTodoItem);
}
