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
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <CheckCircle2 className="size-6 text-primary" />
        </motion.div>
        <div>
          <p className="font-medium">{result.filename}</p>
          <p className="text-sm text-muted-foreground">
            {formatSize(result.size)} · {result.processingTime} мс
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="size-4" />
          Ще раз
        </Button>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={download} className="bg-gradient-primary text-primary-foreground">
            <Download className="size-4" />
            Завантажити
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
