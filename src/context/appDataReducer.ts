import type { CalendarEvent, TodoItem, Settings } from "@/types";
import type { AppData } from "./appDataTypes";

export type AppAction =
  | {
      type: "INIT";
      payload: {
        events: CalendarEvent[];
        todos: TodoItem[];
        settings: Settings;
        selectedDate: string;
        viewMonth: string;
      };
    }
  | { type: "SET_EVENTS"; payload: CalendarEvent[] }
  | { type: "SET_TODOS"; payload: TodoItem[] }
  | { type: "SET_EVENTS_AND_TODOS"; payload: { events: CalendarEvent[]; todos: TodoItem[] } }
  | { type: "SET_SETTINGS"; payload: Settings }
  | { type: "SET_SELECTED_DATE"; payload: string }
  | { type: "SET_VIEW_MONTH"; payload: string }
  | {
      type: "REPLACE_ALL";
      payload: { events: CalendarEvent[]; todos: TodoItem[]; settings: Settings };
    };

export const initialAppData: AppData = {
  events: [],
  todos: [],
  settings: {
    weekStartsOn: 0,
    showCompletedOnHome: true,
    sampleDataSeeded: false,
  },
  selectedDate: "",
  viewMonth: "",
  initialized: false,
};

export function appDataReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        events: action.payload.events,
        todos: action.payload.todos,
        settings: action.payload.settings,
        selectedDate: action.payload.selectedDate,
        viewMonth: action.payload.viewMonth,
        initialized: true,
      };
    case "SET_EVENTS":
      return { ...state, events: action.payload };
    case "SET_TODOS":
      return { ...state, todos: action.payload };
    case "SET_EVENTS_AND_TODOS":
      return { ...state, events: action.payload.events, todos: action.payload.todos };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };
    case "SET_VIEW_MONTH":
      return { ...state, viewMonth: action.payload };
    case "REPLACE_ALL":
      return {
        ...state,
        events: action.payload.events,
        todos: action.payload.todos,
        settings: action.payload.settings,
      };
    default:
      return state;
  }
}
