"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, FileText, Download, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatSize } from "@/lib/utils/sizeFormatter";
import { getExtension } from "@/lib/utils/fileDetector";
import { isMarkdownExt, findSourceFormat } from "@/lib/constants/formats";
import { downloadZipBundle, type BundleEntry } from "@/lib/utils/zipBundle";
import type { ConversionResponse, ConversionSuccess } from "@/types/conversion";

type ItemStatus = "pending" | "converting" | "done" | "error" | "skipped";

interface BatchItem {
  file: File;
  targetExt: string;
  status: ItemStatus;
  result: ConversionSuccess | null;
  error: string | null;
}

/** Pick the default target format for a file (mirrors single-file logic). */
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
  }, [files, updateItem]);

  // Kick off conversion once on mount.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runBatch();
  }, [runBatch]);

  const doneItems = items.filter((it) => it.status === "done" && it.result);
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-medium">
          <Package className="size-5 text-primary" />
          Пакетна конвертація · {files.length} файл(ів)
        </h3>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={running}>
          <RotateCcw className="size-4" />
          Скинути
        </Button>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <motion.li
            key={`${it.file.name}-${i}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={it.file.name}>
                {it.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSize(it.file.size)} → .{it.targetExt}
                {it.error && (
                  <span className="text-destructive"> · {it.error}</span>
                )}
              </p>
            </div>
            <StatusIcon status={it.status} />
          </motion.li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button
          onClick={downloadAll}
          disabled={!allFinished || doneItems.length === 0}
          className="flex-1 bg-gradient-primary text-primary-foreground"
        >
          <Download className="size-4" />
          {running
            ? "Конвертація…"
            : `Завантажити всі (${doneItems.length}) у .zip`}
        </Button>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "converting":
      return <Loader2 className="size-5 animate-spin text-primary" />;
    case "done":
      return <CheckCircle2 className="size-5 text-primary" />;
    case "error":
    case "skipped":
      return <AlertCircle className="size-5 text-destructive" />;
    default:
      return <div className="size-5 rounded-full border-2 border-muted-foreground/30" />;
  }
}
