"use client";

import { useRef, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useToast } from "@/context/ToastContext";
import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Toggle } from "@/components/common/FormFields";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  buildExportBundle,
  parseImport,
} from "@/lib/storage/importExport";
import { nowIso } from "@/lib/date/dateUtils";
import { Download, Upload, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data, updateSettings, clearSampleData, clearAllData, importAll } =
    useAppData();
  const { showToast } = useToast();
  const { settings, events, todos, initialized } = data;
  const fileRef = useRef<HTMLInputElement>(null);

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmClearSample, setConfirmClearSample] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    events: typeof events;
    todos: typeof todos;
    settings: typeof settings;
  } | null>(null);

  if (!initialized) {
    return <LoadingSkeleton />;
  }

  const handleExport = () => {
    try {
      const bundle = buildExportBundle(events, todos, settings, nowIso());
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daylist-backup-${nowIso().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("データをエクスポートしました");
    } catch {
      showToast("エクスポートに失敗しました", "error");
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const result = parseImport(text);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      // 既存データを上書きする前に確認
      setPendingImport({
        events: result.events,
        todos: result.todos,
        settings: result.settings,
      });
    } catch {
      showToast("ファイルの読み込みに失敗しました", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <AppHeader
        title="設定"
        right={
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ChevronLeft size={16} aria-hidden />
            ホーム
          </Link>
        }
      />

      {/* 表示設定 */}
      <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="text-sm font-bold">表示</h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">週の開始曜日</p>
            <p className="text-xs text-muted">カレンダーの並びを変更します</p>
          </div>
          <div className="flex gap-1 rounded-lg bg-surface-muted p-1">
            {[
              { v: 0, label: "日曜" },
              { v: 1, label: "月曜" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() =>
                  updateSettings({ weekStartsOn: o.v as 0 | 1 })
                }
                aria-pressed={settings.weekStartsOn === o.v}
                className={`min-h-[36px] rounded-md px-3 text-sm font-semibold transition ${
                  settings.weekStartsOn === o.v
                    ? "bg-surface text-foreground shadow-card"
                    : "text-muted"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <Toggle
            label="完了済みタスクをホームに表示"
            checked={settings.showCompletedOnHome}
            onChange={(v) => updateSettings({ showCompletedOnHome: v })}
          />
        </div>
      </section>

      {/* データ */}
      <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="text-sm font-bold">データ</h2>
        <p className="text-xs text-muted">
          データはこの端末のブラウザにのみ保存されます。バックアップには
          エクスポートをご利用ください。
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={18} aria-hidden />
            エクスポート
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={18} aria-hidden />
            インポート
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImportFile(f);
          }}
        />
      </section>

      {/* 危険な操作 */}
      <section className="space-y-3 rounded-2xl border border-danger/20 bg-surface p-4 shadow-card">
        <h2 className="text-sm font-bold text-danger">データの削除</h2>
        <button
          type="button"
          onClick={() => setConfirmClearSample(true)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-1 text-sm hover:bg-surface-muted"
        >
          <span>サンプルデータを削除</span>
          <Trash2 size={16} className="text-muted" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setConfirmClearAll(true)}
          className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-1 text-sm font-semibold text-danger hover:bg-danger-soft"
        >
          <span>すべてのデータを削除</span>
          <Trash2 size={16} aria-hidden />
        </button>
      </section>

      <p className="px-1 text-center text-xs text-muted">DayList — MVP</p>

      {/* 確認ダイアログ群 */}
      <ConfirmDialog
        open={confirmClearSample}
        title="サンプルデータを削除しますか？"
        message="サンプルは削除後、再起動しても復活しません。"
        choices={[
          {
            label: "削除する",
            variant: "danger",
            onSelect: () => {
              clearSampleData();
              setConfirmClearSample(false);
            },
          },
        ]}
        onCancel={() => setConfirmClearSample(false)}
      />

      <ConfirmDialog
        open={confirmClearAll}
        title="すべてのデータを削除しますか？"
        message="予定・やること・設定を含むすべてが削除されます。この操作は取り消せません。"
        choices={[
          {
            label: "すべて削除する",
            variant: "danger",
            onSelect: () => {
              clearAllData();
              setConfirmClearAll(false);
            },
          },
        ]}
        onCancel={() => setConfirmClearAll(false)}
      />

      <ConfirmDialog
        open={!!pendingImport}
        title="データをインポートしますか？"
        message={
          pendingImport
            ? `予定 ${pendingImport.events.length} 件、やること ${pendingImport.todos.length} 件を読み込みます。現在のデータは置き換えられます。`
            : ""
        }
        choices={[
          {
            label: "インポートする",
            variant: "primary",
            onSelect: () => {
              if (pendingImport) importAll(pendingImport);
              setPendingImport(null);
            },
          },
        ]}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
