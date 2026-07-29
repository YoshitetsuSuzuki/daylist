/* eslint-disable @next/next/no-html-link-for-pages */
// 静的書き出し(output: export)時、Next 内蔵の _error が描画外で React フックを呼び
// prerender に失敗する不具合を回避するため、フックを一切使わない最小の _error に置換する。
// 実運用の 404 表示は App Router の app/not-found.tsx が担当する。
function ErrorPage({ statusCode }: { statusCode?: number }) {
  const code = statusCode ?? 404;
  return (
    <main style={wrap}>
      <p style={{ fontSize: 40, fontWeight: 700, color: "#4f6bed" }}>{code}</p>
      <p style={{ fontSize: 14, color: "#6c7484" }}>
        {code === 404
          ? "お探しのページは見つかりませんでした。"
          : "問題が発生しました。時間をおいて再度お試しください。"}
      </p>
      <a href="/" style={btn}>
        ホームへ戻る
      </a>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  fontFamily: "system-ui, sans-serif",
  color: "#1e222c",
  background: "#f6f7fa",
};
const btn: React.CSSProperties = {
  marginTop: 8,
  padding: "12px 20px",
  borderRadius: 12,
  background: "#4f6bed",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
};
