# DayList — iOS リリース手順（チェックリスト）

わたくし（凜）が準備済みの項目と、よしてつ様のお手が必要な項目を分けています。

## ✅ 準備済み（実装・設定ずみ）
- 本番アプリアイコン（1024px）＋全サイズ生成（`assets/logo.png` 由来）
- スプラッシュ（ライト／ダーク）
- 最新のアプリ内容をネイティブへ同期（`npm run app:build`）
- iOS ビルド成功を実証（Xcode / xcodebuild）
- iPhone 専用に設定（`TARGETED_DEVICE_FAMILY = 1`）→ iPad スクショ不要
- 暗号化申告（`ITSAppUsesNonExemptEncryption = false`）→ 毎回の質問を省略
- バンドルID `com.yoshitetsu.daylist` / バージョン 1.0 / ビルド 1
- プライバシーポリシー公開: https://yoshitetsusuzuki.github.io/daylist/privacy.html
- ストア掲載文の下書き: `docs/APP_STORE_LISTING.md`

## 🧑‍💻 よしてつ様のお手が必要（Apple アカウント・署名・提出）

### 1. App Store Connect にアプリを登録
- https://appstoreconnect.apple.com → マイApp → ＋ → 新規App
- プラットフォーム: iOS／名前: `docs/APP_STORE_LISTING.md` のApp名／主言語: 日本語
- バンドルID: `com.yoshitetsu.daylist`（Xcodeで自動作成される。無ければ Identifiers で作成）
- SKU: 任意（例 `daylist-001`）

### 2. Xcode で署名 → アーカイブ → アップロード
```bash
# 最新反映してXcodeを開く（日本語パス対策のLANGはスクリプト内蔵）
npm run app:ios
```
- Xcode 左「App」ターゲット → Signing & Capabilities → **Team を自分の Apple Developer に設定**（自動署名）
- 上部の実行先を「Any iOS Device (arm64)」に
- メニュー **Product → Archive**
- 完了後 **Distribute App → App Store Connect → Upload**

> ⚠️ アップロード前に必ず `npm run app:build`（＝ next build && cap sync）が走っていること。
> 本アプリは `out/` の静的ビルドを同梱するため、これが最新版の実体です。

### 3. App Store Connect でメタデータ入力・提出
- `docs/APP_STORE_LISTING.md` から、名前／サブタイトル／キーワード／説明文を貼り付け
- カテゴリ: 仕事効率化／年齢: 4+／価格: 無料
- プライバシーポリシーURL: https://yoshitetsusuzuki.github.io/daylist/privacy.html
- **App のプライバシー**: 「データを収集しない」を選択
- **スクリーンショット**（6.9インチ 1290×2796 を3〜10枚）をアップロード
  - 実機 or シミュレータで撮影 → 音量↑+サイドボタン、またはシミュレータの ⌘S
- ビルドを選択 → 「審査へ提出」

## 次バージョンでやること（メモ）
- 広告（後日）: 追加時はプライバシーポリシー＆App プライバシー表記を更新
- iPad 対応を戻すなら `TARGETED_DEVICE_FAMILY = "1,2"` ＋ iPad スクショ
- Android（Google Play）: `npm run app:android`（要 JDK 17・Play Console $25）
