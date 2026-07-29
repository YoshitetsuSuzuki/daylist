"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, X } from "lucide-react";
import { fileToCompressedDataUrl } from "@/lib/image";
import { useToast } from "@/context/ToastContext";

const MAX_PHOTOS = 6;

/**
 * 写真添付。value(圧縮済み data URL の配列) を onChange で更新する。
 * - 追加時に長辺1024px・JPEG へ圧縮して localStorage に収まるサイズにする
 * - サムネイルはタップで拡大表示、×で削除
 */
export function PhotoAttach({
  value,
  onChange,
}: {
  value: string[];
  onChange: (photos: string[]) => void;
}) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - value.length;
    if (remaining <= 0) {
      showToast(`写真は最大${MAX_PHOTOS}枚までです`, "error");
      return;
    }
    setBusy(true);
    try {
      const picked = Array.from(files).slice(0, remaining);
      const added: string[] = [];
      for (const file of picked) {
        if (!file.type.startsWith("image/")) continue;
        try {
          added.push(await fileToCompressedDataUrl(file));
        } catch {
          showToast("写真の読み込みに失敗しました", "error");
        }
      }
      if (added.length) onChange([...value, ...added]);
      if (files.length > remaining) {
        showToast(`写真は最大${MAX_PHOTOS}枚までです`, "info");
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={i} className="relative h-20 w-20">
            <button
              type="button"
              onClick={() => setPreview(src)}
              className="h-full w-full overflow-hidden rounded-xl border border-border"
              aria-label={`写真 ${i + 1} を拡大`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`添付写真 ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`写真 ${i + 1} を削除`}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-white shadow"
            >
              <X size={13} aria-hidden />
            </button>
          </div>
        ))}

        {value.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface-muted/50 text-muted hover:bg-surface-muted disabled:opacity-50"
          >
            <ImagePlus size={20} aria-hidden />
            <span className="text-[11px] font-medium">
              {busy ? "処理中…" : "写真を追加"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 拡大プレビュー */}
      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label="写真プレビュー"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="添付写真の拡大"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="閉じる"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <X size={22} aria-hidden />
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
