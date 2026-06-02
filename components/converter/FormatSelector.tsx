"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { FROM_MARKDOWN_FORMATS, findSourceFormat } from "@/lib/constants/formats";
import type { TargetFormat } from "@/types/formats";

interface FormatSelectorProps {
  /** "toMarkdown" when a non-md file was uploaded, else "fromMarkdown". */
  direction: "toMarkdown" | "fromMarkdown";
  /** Source file extension (used to check implementation in toMarkdown mode). */
  sourceExt: string;
  /** Currently selected target extension. */
  selected: string;
  onSelect: (ext: string) => void;
}

export function FormatSelector({ direction, sourceExt, selected, onSelect }: FormatSelectorProps) {
  if (direction === "toMarkdown") {
    const src = findSourceFormat(sourceExt);
    const supported = src?.implemented ?? false;
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-center gap-3 text-lg font-medium">
          <span className="rounded-md bg-secondary px-3 py-1.5">
            {src?.icon ?? "📄"} {sourceExt.toUpperCase()}
          </span>
          <ArrowRight className="size-5 text-primary" />
          <span className="rounded-md bg-gradient-primary px-3 py-1.5 text-primary-foreground">
            ⬇️ Markdown
          </span>
        </div>
        {!supported && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-destructive">
            <Lock className="size-4" />
            Формат .{sourceExt} ще не підтримується (скоро).
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-3 text-sm font-medium text-muted-foreground">
        Оберіть формат для конвертації з Markdown:
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FROM_MARKDOWN_FORMATS.map((f) => (
          <FormatCard
            key={f.ext}
            format={f}
            active={selected === f.ext}
            onSelect={() => f.implemented && onSelect(f.ext)}
          />
        ))}
      </div>
    </div>
  );
}

function FormatCard({
  format,
  active,
  onSelect,
}: {
  format: TargetFormat;
  active: boolean;
  onSelect: () => void;
}) {
  const disabled = !format.implemented;
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -2 }}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={active}
      className={[
        "relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
        disabled
          ? "cursor-not-allowed border-border bg-secondary/30 opacity-50"
          : active
            ? "border-primary bg-primary/10 shadow-sm"
            : "border-border bg-secondary/40 hover:border-primary/60",
      ].join(" ")}
    >
      <span className="text-2xl">{format.icon}</span>
      <span className="text-sm font-medium">{format.label}</span>
      <span className="text-xs text-muted-foreground">{format.description}</span>
      {disabled && (
        <span className="absolute right-1.5 top-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Скоро
        </span>
      )}
    </motion.button>
  );
}
