"use client";

import { motion } from "framer-motion";
import { Download, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSize } from "@/lib/utils/sizeFormatter";
import type { ConversionSuccess } from "@/types/conversion";

interface ResultDownloaderProps {
  result: ConversionSuccess;
  onReset: () => void;
}

export function ResultDownloader({ result, onReset }: ResultDownloaderProps) {
  const download = () => {
    let blob: Blob;
    if (result.encoding === "base64") {
      const binary = atob(result.content);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      blob = new Blob([bytes], { type: result.mimeType });
    } else {
      blob = new Blob([result.content], { type: result.mimeType });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.15, 1] }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10"
      >
        <CheckCircle2 className="size-8 text-primary" />
      </motion.div>
      <div>
        <p className="font-semibold">Готово!</p>
        <p className="mt-1 truncate text-sm font-medium" title={result.filename}>
          {result.filename}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatSize(result.size)} · {result.processingTime} мс
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          onClick={download}
          className="bg-gradient-primary text-primary-foreground"
        >
          <Download className="size-4" />
          Завантажити
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="size-4" />
          Конвертувати ще
        </Button>
      </div>
    </div>
  );
}
