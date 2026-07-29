/** @type {import('next').NextConfig} */

// GitHub Pages のプロジェクトページはサブパス配信のため basePath が必要。
// GITHUB_PAGES=true のビルド時だけ有効化する。
// （Vercel / Capacitor / ローカルはルート配信なので basePath なし）
const basePath = process.env.GITHUB_PAGES === "true" ? "/daylist" : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  // クライアント側（manifest.ts / Service Worker 登録など）でも参照できるよう公開する
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
