"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingAddButton } from "./FloatingAddButton";
import { ToastViewport } from "@/components/common/ToastViewport";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { ThemeApplier } from "./ThemeApplier";

/**
 * クライアント側のプロバイダとグローバル UI をまとめる。
 * 順序: ToastProvider → AppDataProvider（AppData は保存失敗時に Toast を使うため内側）。
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppDataProvider>
        <div className="mx-auto min-h-dvh w-full max-w-2xl px-4 pb-28 pt-4">
          {children}
        </div>
        <BottomNavigation />
        <FloatingAddButton />
        <ToastViewport />
        <ServiceWorkerRegister />
        <ThemeApplier />
      </AppDataProvider>
    </ToastProvider>
  );
}
