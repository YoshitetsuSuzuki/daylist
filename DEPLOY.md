# DayList 配布ガイド

DayList は完全にローカル完結（localStorage）の PWA です。`next build` で `out/` に
**静的サイト**として書き出され、そのまま次の2通りに使えます。

1. **Web 公開（Vercel 等）** — スマホでURLを開き「ホーム画面に追加」で常駐
2. **アプリストア（Capacitor）** — 同じ `out/` をネイティブアプリの殻に同梱し、App Store / Google Play へ

---

## 1. Web で公開する（Vercel）

### 前提
- Vercel アカウント（無料枠でOK）
- このプロジェクトを GitHub 等に push、または Vercel CLI を使用

### 手順A：Vercel CLI（最短）
```bash
npm i -g vercel
cd /Users/yoshitetsu/カレンダーアプリ
vercel        # 初回はログイン→質問に沿って進む
vercel --prod # 本番URLを発行
```
- Framework Preset は自動で **Next.js** を検出します。`output: export` のため静的配信されます。
- 発行された `https://xxxxx.vercel.app` をスマホで開けます。

### 手順B：GitHub 連携
1. リポジトリを GitHub に push
2. Vercel ダッシュボード → **Add New → Project** → リポジトリを選択 → Deploy
3. 以後、push するたびに自動デプロイ

### スマホでホーム画面に追加
- **iOS(Safari)**：URLを開く → 共有ボタン → 「ホーム画面に追加」
- **Android(Chrome)**：URLを開く → メニュー → 「アプリをインストール / ホーム画面に追加」

> 補足：他の静的ホスティング（Cloudflare Pages / Netlify / GitHub Pages）でも
> `out/` をそのまま配信できます。GitHub Pages のようにサブパス配信をする場合のみ、
> `next.config.mjs` に `basePath` / `assetPrefix` の設定が必要です。

---

## 2. アプリストア向け（Capacitor）

既に iOS / Android のネイティブプロジェクトを生成済みです（`ios/` `android/`）。
Web資産の同期は `npm run app:build`（= `next build && cap sync`）で行います。

> **重要**：このフォルダ名が日本語のため、CocoaPods が文字コードで失敗します。
> npm スクリプトには `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` を組み込み済みです。
> 手動で `pod install` する場合も同じ環境変数を付けてください。

### iOS（要 Xcode・CocoaPods。両方インストール済み）
```bash
cd /Users/yoshitetsu/カレンダーアプリ
npm run app:ios   # ビルド→同期→Xcodeを開く
```
Xcode で実機/シミュレータへ実行。App Store 申請時は
- `App` ターゲットの Signing（Apple Developer アカウント / 年99ドル）
- `appId`（現在 `com.yoshitetsu.daylist`）を自分のものへ確定
- アイコン（現在は仮画像。本番アイコンに差し替え推奨）

### Android（要 JDK 17・Android SDK）
```bash
# JDK 17 が未導入の場合（例）
brew install openjdk@17
npm run app:android   # ビルド→同期→Android Studioを開く
```
Android Studio で Gradle Sync → 実行。Google Play 申請時は署名鍵の作成が必要です。

### App Store 審査の要点（ガイドライン 4.2 対策）
DayList はオフラインで完結する実用アプリのため「単なるWebViewのサイト」には当たりません。
通過確度を上げるには、ネイティブらしさ（アプリアイコン・スプラッシュ・
`server.url` を使わず `out/` を同梱）を保つこと。

---

## 開発中に実機で確認したいとき
`capacitor.config.ts` の `server.url` を一時的にPCのローカルIP（`npm run dev` のポート）へ
向けると、実機から即時反映で確認できます。**本番ビルドでは必ず無効化**してください。
