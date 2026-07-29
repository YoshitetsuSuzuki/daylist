import Link from "next/link";

/**
 * App Router の 404。
 * これを用意することで、静的書き出し(output: export)時に
 * 既定の Pages Router エラーページを使わずに済む。
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <p className="text-sm text-muted">
        お探しのページは見つかりませんでした。
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
