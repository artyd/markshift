"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUploader } from "./FileUploader";
import { BatchConverter } from "./BatchConverter";
import { PreviewModal } from "./PreviewModal";
import { getExtension } from "@/lib/utils/fileDetector";
import { isMarkdownExt } from "@/lib/constants/formats";
import type { ConversionResponse, ConversionSuccess } from "@/types/conversion";

function handleDownload(result: ConversionSuccess) {
  const bytes =
    result.encoding === "base64"
      ? Uint8Array.from(atob(result.content), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(result.content);
  const blob = new Blob([bytes], { type: result.mimeType });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: result.filename,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}

type Phase = "idle" | "ready" | "converting" | "done" | "error";

interface State {
  phase: Phase;
  file: File | null;
  targetExt: string;
  progress: number;
  result: ConversionSuccess | null;
  error: string | null;
}

type Action =
  | { type: "select"; file: File }
  | { type: "clear" }
  | { type: "setTarget"; ext: string }
  | { type: "start" }
  | { type: "progress"; value: number }
  | { type: "success"; result: ConversionSuccess }
  | { type: "fail"; error: string };

const initialState: State = {
  phase: "idle",
  file: null,
  targetExt: "md",
  progress: 0,
  result: null,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select": {
      const md = isMarkdownExt(getExtension(action.file.name));
      return {
        ...initialState,
        phase: "ready",
        file: action.file,
        targetExt: md ? "html" : "md",
      };
    }
    case "clear":
      return initialState;
    case "setTarget":
      return { ...state, targetExt: action.ext };
    case "start":
      return { ...state, phase: "converting", progress: 8, error: null };
    case "progress":
      return { ...state, progress: action.value };
    case "success":
      return { ...state, phase: "done", progress: 100, result: action.result };
    case "fail":
      return { ...state, phase: "error", error: action.error };
    default:
      return state;
  }
}

export function ConverterZone() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const allFiles = state.file ? [state.file, ...extraFiles] : [];

  const stopProgress = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  useEffect(() => () => stopProgress(), [stopProgress]);

  useEffect(() => {
    if (state.phase === "idle") setExtraFiles([]);
  }, [state.phase]);

  const convert = useCallback(async () => {
    if (!state.file) return;
    dispatch({ type: "start" });

    progressTimer.current = setInterval(() => {
      dispatch({ type: "progress", value: Math.min(90, Math.random() * 12 + 30) });
    }, 350);

    try {
      const form = new FormData();
      form.append("file", state.file);
      form.append("targetFormat", state.targetExt);
      form.append("options", JSON.stringify({ includeMetadata: false, tableStyle: "github" }));

      const res = await fetch("/api/convert", { method: "POST", body: form });
      const data = (await res.json()) as ConversionResponse;
      stopProgress();

      if (!data.success) {
        dispatch({ type: "fail", error: data.error });
        toast.error(data.error);
        return;
      }
      dispatch({ type: "success", result: data });
      if (data.warnings?.length) {
        data.warnings.forEach((w) => toast.warning(w));
      }
      toast.success("Готово!");
    } catch {
      stopProgress();
      const msg = "Помилка мережі. Спробуйте ще раз.";
      dispatch({ type: "fail", error: msg });
      toast.error(msg);
    }
  }, [state.file, state.targetExt, stopProgress]);

  // FileUploader handlers
  const onAddFiles = useCallback((fs: File[]) => {
    if (allFiles.length === 0) {
      dispatch({ type: "select", file: fs[0] });
      if (fs.length > 1) setExtraFiles(fs.slice(1));
    } else {
      setExtraFiles(prev => [...prev, ...fs]);
    }
  }, [allFiles.length]);

  const removeFile = useCallback((index: number) => {
    if (index === 0) {
      if (extraFiles.length > 0) {
        const [newPrimary, ...rest] = extraFiles;
        dispatch({ type: "select", file: newPrimary });
        setExtraFiles(rest);
      } else {
        dispatch({ type: "clear" });
      }
    } else {
      setExtraFiles(prev => prev.filter((_, i) => i !== index - 1));
    }
  }, [extraFiles]);

  const onRemoveFile = useCallback((name: string) => {
    const index = allFiles.findIndex(f => f.name === name);
    if (index >= 0) removeFile(index);
  }, [allFiles, removeFile]);

  const onConvert = useCallback(() => {
    if (allFiles.length > 1) setBatchFiles(allFiles);
    else convert();
  }, [allFiles, convert]);

  const handleDownloadAll = useCallback(() => {
    if (state.result) handleDownload(state.result);
  }, [state.result]);

  const handleReset = () => dispatch({ type: 'clear' });

  // results array for PreviewModal
  const results = state.result ? [state.result] : [];

  if (batchFiles) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <BatchConverter files={batchFiles} onReset={() => setBatchFiles(null)} />
      </div>
    );
  }

  return (
    <>
      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        files={results.map(r => ({
          filename: r.filename,
          content: r.content ?? r.preview ?? '',
          mimeType: r.mimeType,
          isText: r.encoding === 'utf-8',
        }))}
      />

      <div className={`mx-auto w-full ${state.phase === "done" ? "max-w-3xl" : "max-w-2xl"}`}>
        <AnimatePresence mode="wait">

          {(state.phase === "idle" || state.phase === "ready") && (
            <motion.div key="idle-ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FileUploader
                files={allFiles}
                onAddFiles={onAddFiles}
                onRemoveFile={onRemoveFile}
                onConvert={onConvert}
                isConverting={false}
                onReject={(m) => toast.error(m)}
              />
            </motion.div>
          )}

          {state.phase === "converting" && (
            <motion.div key="converting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '28px', padding: '48px', width: '100%',
              }}>
                <div style={{ width: '100%', maxWidth: '320px' }}>
                  <div style={{
                    height: '3px', background: 'hsl(var(--muted))',
                    borderRadius: '9999px', overflow: 'hidden', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: '35%', background: 'hsl(var(--foreground))',
                      borderRadius: '9999px',
                      animation: 'slide-progress 1.2s ease-in-out infinite',
                    }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '6px' }}>
                    Конвертую файл...
                  </div>
                  <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Зачекай кілька секунд</div>
                </div>
              </div>
            </motion.div>
          )}

          {state.phase === "done" && state.result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{
                width: '100%', maxWidth: '700px',
                margin: '0 auto',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '32px',
              }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                    {results.length === 1 ? 'Файл готовий' : `${results.length} файли готові`}
                  </div>
                  <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                    Конвертація завершена успішно
                  </div>
                </div>

                {/* Three action cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '100%' }}>

                  {/* DOWNLOAD — foreground fill */}
                  <button
                    onClick={handleDownloadAll}
                    style={{
                      padding: '28px 20px',
                      border: '1.5px solid hsl(var(--foreground))', borderRadius: '16px',
                      background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                      transition: 'all 0.22s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span style={{ fontSize: '32px' }}>⬇</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>Скачати</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                        {results.length > 1 ? `${results.length} файли · .zip` : results[0]?.filename}
                      </div>
                    </div>
                  </button>

                  {/* PREVIEW — card outline */}
                  <button
                    onClick={() => setPreviewOpen(true)}
                    style={{
                      padding: '28px 20px',
                      border: '1.5px solid hsl(var(--border))', borderRadius: '16px',
                      background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                      transition: 'all 0.22s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground))'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span style={{ fontSize: '32px' }}>👁</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>Перегляд</div>
                      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                        {results.length > 1 ? `${results.length} вкладки` : 'Відкрити файл'}
                      </div>
                    </div>
                  </button>

                  {/* BACK — card outline */}
                  <button
                    onClick={handleReset}
                    style={{
                      padding: '28px 20px',
                      border: '1.5px solid hsl(var(--border))', borderRadius: '16px',
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
            </motion.div>
          )}

          {state.phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center"
            >
              <AlertTriangle className="size-10 text-destructive" />
              <p className="font-medium">{state.error}</p>
              <Button variant="secondary" onClick={() => dispatch({ type: "clear" })}>
                Спробувати знову
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}
