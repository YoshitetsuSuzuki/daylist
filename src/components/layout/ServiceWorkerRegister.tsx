"use client";

import { useEffect } from "react";

/** PWA: Service Worker を登録（本番のみ・オフライン表示用）。 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    // Capacitor（ネイティブアプリの殻）内ではオフラインは本体が担うため SW は登録しない
    if ("Capacitor" in window) {
      return;
    }
    const onLoad = () => {
      // サブパス配信(GitHub Pages)でも正しい位置の sw.js を登録する
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      navigator.serviceWorker
        .register(`${base}/sw.js`, { scope: `${base}/` })
        .catch(() => {
          // 登録失敗はサイレントに（オフライン非対応でも動作は継続）
        });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
