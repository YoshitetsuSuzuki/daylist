import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor 設定。
 * - webDir: Next の静的書き出し先。`npm run build` で out/ が生成される。
 * - appId: App Store / Google Play で使う逆ドメイン形式の一意ID。
 *   ストア申請前に自分のドメイン/組織に合わせて確定すること。
 */
const config: CapacitorConfig = {
  appId: "com.yoshitetsu.daylist",
  appName: "DayList",
  webDir: "out",
  ios: {
    contentInset: "always",
  },
  // 開発中に実機/シミュレータからローカルの dev サーバーを見たい場合は、
  // 下記 server.url を有効化する（本番ビルドでは必ず無効化＝out/ を同梱すること）。
  // server: { url: "http://192.168.x.x:5196", cleartext: true },
};

export default config;
