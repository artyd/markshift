"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUploader } from "./FileUploader";
import { FormatSelector } from "./FormatSelector";
import { ConversionProgress } from "./ConversionProgress";
import { ResultDownloader } from "./ResultDownloader";
import { MarkdownPreview } from "./MarkdownPreview";
import { BatchConverter } from "./BatchConverter";
import { getExtension } from "@/lib/utils/fileDetector";
import { isMarkdownExt, findSourceFormat } from "@/lib/constants/formats";
import type { ConversionResponse, ConversionSuccess } from "@/types/conversion";

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
            className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_3fr] lg:items-start"
          >
            <ResultDownloader result={state.result} onReset={() => dispatch({ type: "clear" })} />
            <MarkdownPreview
              content={state.result.content}
              mimeType={state.result.mimeType}
              encoding={state.result.encoding}
            />
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
