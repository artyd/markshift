"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSize } from "@/lib/utils/sizeFormatter";
import { getExtension } from "@/lib/utils/fileDetector";
import { ACCEPTED_SOURCE_EXTS } from "@/lib/constants/formats";
import { LIMITS } from "@/lib/constants/limits";

/** Max files accepted in a single batch drop. */
const MAX_BATCH_FILES = 20;

interface FileUploaderProps {
  file: File | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  onReject: (message: string) => void;
  /** Allow selecting several files at once (batch mode). */
  multiple?: boolean;
  /** Called with all accepted files when `multiple` is enabled. */
  onSelectMany?: (files: File[]) => void;
}

export function FileUploader({
  file,
  onSelect,
  onClear,
  onReject,
  multiple = false,
  onSelectMany,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const code = rejections[0].errors[0]?.code;
        const message =
          code === "file-too-large"
            ? `Файл завеликий. Максимум ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ.`
            : code === "too-many-files"
              ? `Можна завантажити максимум ${MAX_BATCH_FILES} файлів за раз.`
              : "Не вдалося прийняти файл.";
        onReject(message);
        return;
      }
      const valid: File[] = [];
      for (const f of accepted) {
        const ext = getExtension(f.name);
        if (ACCEPTED_SOURCE_EXTS.includes(ext)) valid.push(f);
        else onReject(`Формат .${ext || "?"} не підтримується (${f.name}).`);
      }
      if (valid.length === 0) return;

      if (multiple && valid.length > 1 && onSelectMany) {
        onSelectMany(valid);
      } else {
        onSelect(valid[0]);
      }
    },
    [onSelect, onSelectMany, onReject, multiple],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize: LIMITS.MAX_FILE_SIZE,
    maxFiles: multiple ? MAX_BATCH_FILES : 1,
    multiple,
    noClick: Boolean(file),
    noKeyboard: Boolean(file),
  });

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium" title={file.name}>
            {file.name}
          </p>
          <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          aria-label="Прибрати файл"
        >
          <X className="size-5" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={[
        "relative mx-auto flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed bg-card p-12 text-center shadow-sm transition-all duration-200 md:p-16",
        isDragActive
          ? "scale-[1.02] border-primary bg-primary/5 shadow-lg"
          : "border-border hover:border-primary/60 hover:bg-secondary/40",
      ].join(" ")}
      aria-label="Зона завантаження файлу"
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
        className="flex size-20 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
      >
        <UploadCloud className="size-10" />
      </motion.div>
      <div>
        <p className="text-xl font-medium">
          {isDragActive ? "Відпустіть файл тут" : "Перетягніть файл або натисніть"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          До {LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ · {multiple ? `до ${MAX_BATCH_FILES} файлів` : "один файл за раз"}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      >
        Обрати файл
      </Button>
    </div>
  );
}
