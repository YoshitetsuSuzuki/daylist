import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/layout/ClientProviders";
import { BASE_PATH } from "@/lib/basePath";

export const metadata: Metadata = {
  applicationName: "DayList",
  title: "DayList",
  description: "予定とやることをシンプルに管理できるカレンダーアプリ",
  // サブパス配信(GitHub Pages)でも解決できるよう BASE_PATH を前置する
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DayList",
  },
  icons: {
    icon: `${BASE_PATH}/icons/icon.svg`,
    apple: `${BASE_PATH}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f6bed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
