"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUploader } from "./FileUploader";
import { FormatSelector } from "./FormatSelector";
import { ConversionProgress } from "./ConversionProgress";
import { MarkdownPreview } from "./MarkdownPreview";
import { BatchConverter } from "./BatchConverter";
import { getExtension } from "@/lib/utils/fileDetector";
import { formatSize } from "@/lib/utils/sizeFormatter";
import { isMarkdownExt, findSourceFormat } from "@/lib/constants/formats";
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
  const [batchFiles, setBatchFiles] = useState<File[] | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopProgress = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  useEffect(() => () => stopProgress(), [stopProgress]);

  const direction = state.file && isMarkdownExt(getExtension(state.file.name))
    ? "fromMarkdown"
    : "toMarkdown";
  const sourceExt = state.file ? getExtension(state.file.name) : "";

  const canConvert =
    state.file != null &&
    (direction === "toMarkdown"
      ? (findSourceFormat(sourceExt)?.implemented ?? false)
      : Boolean(state.targetExt));

  const convert = useCallback(async () => {
    if (!state.file) return;
    dispatch({ type: "start" });

    // Simulate processing progress while the request is in flight.
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

  if (batchFiles) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <BatchConverter files={batchFiles} onReset={() => setBatchFiles(null)} />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full ${
        state.phase === "done" ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      <AnimatePresence mode="wait">
        {state.phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FileUploader
              file={null}
              multiple
              onSelect={(f) => dispatch({ type: "select", file: f })}
              onSelectMany={(fs) => setBatchFiles(fs)}
              onClear={() => dispatch({ type: "clear" })}
              onReject={(m) => toast.error(m)}
            />
          </motion.div>
        )}

        {state.phase === "ready" && state.file && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <FileUploader
              file={state.file}
              onSelect={(f) => dispatch({ type: "select", file: f })}
              onClear={() => dispatch({ type: "clear" })}
              onReject={(m) => toast.error(m)}
            />
            <FormatSelector
              direction={direction}
              sourceExt={sourceExt}
              selected={state.targetExt}
              onSelect={(ext) => dispatch({ type: "setTarget", ext })}
            />
            <Button
              size="lg"
              disabled={!canConvert}
              onClick={convert}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Sparkles className="size-5" />
              Конвертувати
            </Button>
          </motion.div>
        )}

        {state.phase === "converting" && (
          <motion.div key="converting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ConversionProgress value={state.progress} />
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
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '24px', width: '90%', margin: '0 auto',
            }}>
              {/* Left column: result info + actions */}
              <div style={{
                background: 'white', borderRadius: '20px',
                border: '1px solid #E8E8E8', padding: '40px',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: '#F0FFF4', border: '1px solid #BBF7D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A' }}>Файл готовий!</div>
                  <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>{state.result.filename}</div>
                </div>

                <button
                  onClick={() => handleDownload(state.result!)}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px',
                    background: '#1a1a1a', color: 'white', border: 'none',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                >
                  ↓ Завантажити {state.result.filename}
                </button>

                <button
                  onClick={() => dispatch({ type: 'clear' })}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: 'transparent', color: '#555',
                    border: '1px solid #E2E8F0', fontSize: '14px', cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  ↩ Конвертувати ще один файл
                </button>

                <div style={{
                  background: '#FAFAFA', borderRadius: '12px', padding: '16px',
                  fontSize: '13px', color: '#666', lineHeight: 2,
                }}>
                  <div>📁 {getExtension(state.file?.name ?? '').toUpperCase()} → {state.targetExt.toUpperCase()}</div>
                  <div>📏 {formatSize(state.file?.size ?? 0)} → {formatSize(state.result.size)}</div>
                  <div>⏱ {state.result.processingTime}мс</div>
                </div>
              </div>

              {/* Right column: Markdown preview */}
              <div style={{
                background: 'white', borderRadius: '20px',
                border: '1px solid #E8E8E8', overflow: 'hidden',
                maxHeight: '520px', display: 'flex', flexDirection: 'column',
              }}>
                <MarkdownPreview
                  content={state.result.preview ?? state.result.content}
                  mimeType={state.result.mimeType}
                  encoding={state.result.encoding}
                />
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
  );
}
