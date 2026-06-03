"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getExtension } from "@/lib/utils/fileDetector";
import { isMarkdownExt, findSourceFormat } from "@/lib/constants/formats";
import { downloadZipBundle, type BundleEntry } from "@/lib/utils/zipBundle";
import { PreviewModal } from "./PreviewModal";
import type { ConversionResponse, ConversionSuccess } from "@/types/conversion";

type ItemStatus = "pending" | "converting" | "done" | "error" | "skipped";

interface BatchItem {
  file: File;
  targetExt: string;
  status: ItemStatus;
  result: ConversionSuccess | null;
  error: string | null;
}

function defaultTarget(file: File): { ext: string; supported: boolean } {
  const ext = getExtension(file.name);
  if (isMarkdownExt(ext)) return { ext: "html", supported: true };
  return { ext: "md", supported: findSourceFormat(ext)?.implemented ?? false };
}

export function BatchConverter({ files, onReset }: { files: File[]; onReset: () => void }) {
  const [items, setItems] = useState<BatchItem[]>(() =>
    files.map((file) => {
      const { ext, supported } = defaultTarget(file);
      return {
        file,
        targetExt: ext,
        status: supported ? "pending" : "skipped",
        result: null,
        error: supported ? null : "Формат не підтримується",
      };
    }),
  );
  const [running, setRunning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const startedRef = useRef(false);

  const updateItem = useCallback((index: number, patch: Partial<BatchItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }, []);

  const runBatch = useCallback(async () => {
    setRunning(true);
    for (let i = 0; i < files.length; i++) {
      const { ext, supported } = defaultTarget(files[i]);
      if (!supported) continue;
      updateItem(i, { status: "converting" });
      try {
        const form = new FormData();
        form.append("file", files[i]);
        form.append("targetFormat", ext);
        form.append("options", JSON.stringify({ includeMetadata: false, tableStyle: "github" }));
        const res = await fetch("/api/convert", { method: "POST", body: form });
        const data = (await res.json()) as ConversionResponse;
        if (!data.success) {
          updateItem(i, { status: "error", error: data.error });
        } else {
          updateItem(i, { status: "done", result: data });
        }
      } catch {
        updateItem(i, { status: "error", error: "Помилка мережі" });
      }
    }
    setRunning(false);
    toast.success("Конвертація завершена!");
  }, [files, updateItem]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runBatch();
  }, [runBatch]);

  const doneItems = items.filter((it) => it.status === "done" && it.result);
  const doneCount = items.filter((it) => it.status === "done" || it.status === "error" || it.status === "skipped").length;
  const allFinished = !running && items.every((it) => it.status !== "pending" && it.status !== "converting");

  const downloadAll = async () => {
    const entries: BundleEntry[] = doneItems.map((it) => ({
      filename: it.result!.filename,
      content: it.result!.content,
      encoding: it.result!.encoding,
    }));
    if (entries.length === 0) {
      toast.error("Немає файлів для завантаження.");
      return;
    }
    try {
      await downloadZipBundle(entries);
      toast.success(`Завантажено ${entries.length} файл(ів) у zip.`);
    } catch {
      toast.error("Не вдалося зібрати zip-архів.");
    }
  };

  return (
    <>
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        files={doneItems.map(it => ({
          filename: it.result!.filename,
          content: it.result!.content ?? it.result!.preview ?? '',
          mimeType: it.result!.mimeType,
          isText: it.result!.encoding === 'utf-8',
        }))}
      />

      {/* Converting — spinner */}
      {!allFinished && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '24px', padding: '48px', width: '100%',
        }}>
          <div style={{
            width: '56px', height: '56px',
            border: '3px solid #E0E0E0',
            borderTop: '3px solid #111111',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
              Конвертую {files.length} файли...
            </div>
            <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
              {doneCount} з {files.length} готово
            </div>
          </div>
        </div>
      )}

      {/* Done — three cards */}
      {allFinished && (
        <div style={{
          width: '100%', maxWidth: '700px',
          margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '32px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
              {doneItems.length} з {files.length} файли готові
            </div>
            <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
              Конвертація завершена успішно
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>

            {/* DOWNLOAD */}
            <button
              onClick={downloadAll}
              disabled={doneItems.length === 0}
              style={{
                padding: '28px 20px', borderRadius: '16px',
                border: '1.5px solid hsl(var(--foreground))',
                background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                transition: 'all 0.22s ease',
                opacity: doneItems.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (doneItems.length > 0) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = doneItems.length === 0 ? '0.5' : '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '32px' }}>⬇</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Скачати</div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                  {doneItems.length} файли · .zip
                </div>
              </div>
            </button>

            {/* PREVIEW */}
            <button
              onClick={() => setPreviewOpen(true)}
              disabled={doneItems.length === 0}
              style={{
                padding: '28px 20px', borderRadius: '16px',
                border: '1.5px solid hsl(var(--border))',
                background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                transition: 'all 0.22s ease',
                opacity: doneItems.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (doneItems.length > 0) { e.currentTarget.style.borderColor = 'hsl(var(--foreground))'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '32px' }}>👁</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Перегляд</div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                  {doneItems.length} вкладки
                </div>
              </div>
            </button>

            {/* BACK */}
            <button
              onClick={onReset}
              style={{
                padding: '28px 20px', borderRadius: '16px',
                border: '1.5px solid hsl(var(--border))',
                background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                transition: 'all 0.22s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground))'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '32px' }}>↩</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>Назад</div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>Конвертувати ще</div>
              </div>
            </button>

          </div>
        </div>
      )}
    </>
  );
}
