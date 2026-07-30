"use client";

import { useEffect } from "react";
import { useAppData } from "@/context/AppDataContext";
import { DEFAULT_THEME } from "@/types";

/**
 * 選択中のカラーテーマを <html data-theme="..."> に反映する。
 * globals.css の変数上書きにより全画面へ適用される。
 * indigo（既定）は属性を外して :root の値を使う。
 */
export function ThemeApplier() {
  const { data } = useAppData();
  const theme = data.settings.theme ?? DEFAULT_THEME;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "indigo") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}
