/** Direction of a conversion relative to Markdown. */
export type ConversionDirection = "toMarkdown" | "fromMarkdown";

/** A file format that can be the source for a "to Markdown" conversion. */
export interface SourceFormat {
  /** Lowercase file extension without the dot, e.g. "docx". */
  ext: string;
  /** Canonical MIME type. */
  mime: string;
  /** Human-readable label (Ukrainian-friendly, kept short). */
  label: string;
  /** Emoji icon shown in the UI. */
  icon: string;
  /** Whether a converter is actually wired up. `false` → shown as "Скоро". */
  implemented: boolean;
}

/** A target format for a "from Markdown" conversion. */
export interface TargetFormat {
  ext: string;
  label: string;
  icon: string;
  description: string;
  implemented: boolean;
}
