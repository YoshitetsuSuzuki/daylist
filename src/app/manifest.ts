import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/basePath";

/**
 * PWA マニフェスト（動的生成）。
 * サブパス配信(GitHub Pages)でも壊れないよう、start_url / scope / icons を
 * BASE_PATH 付きで組み立てる。ルート配信時は BASE_PATH="" でそのまま機能する。
 */
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const base = BASE_PATH || "";
  return {
    name: "DayList",
    short_name: "DayList",
    description: "予定とやることをシンプルに管理できるカレンダーアプリ",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7fa",
    theme_color: "#4f6bed",
    lang: "ja",
    dir: "ltr",
    icons: [
      {
        src: `${base}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${base}/icons/icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
