import type { SourceFormat, TargetFormat } from "@/types/formats";

/**
 * Every format that can be converted INTO Markdown.
 * `implemented: true` means a converter is wired up in conversionRouter;
 * the rest render as "Скоро" (coming soon) and are blocked in the UI.
 */
export const TO_MARKDOWN_FORMATS: SourceFormat[] = [
  // Документи
  {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word",
    icon: "📄",
    implemented: true,
  },
  { ext: "doc", mime: "application/msword", label: "Word 97-2003", icon: "📄", implemented: true },
  { ext: "pdf", mime: "application/pdf", label: "PDF", icon: "📕", implemented: true },
  {
    ext: "odt",
    mime: "application/vnd.oasis.opendocument.text",
    label: "OpenDocument",
    icon: "📄",
    implemented: true,
  },
  { ext: "rtf", mime: "application/rtf", label: "Rich Text", icon: "📝", implemented: true },

  // Веб
  { ext: "html", mime: "text/html", label: "HTML", icon: "🌐", implemented: true },
  { ext: "htm", mime: "text/html", label: "HTML", icon: "🌐", implemented: true },

  // Дані / таблиці
  { ext: "csv", mime: "text/csv", label: "CSV", icon: "📊", implemented: true },
  {
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    label: "Excel",
    icon: "📊",
    implemented: true,
  },
  { ext: "xls", mime: "application/vnd.ms-excel", label: "Excel 97-2003", icon: "📊", implemented: true },

  // Презентації
  {
    ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint",
    icon: "📽️",
    implemented: true,
  },

  // Структуровані дані
  { ext: "json", mime: "application/json", label: "JSON", icon: "🔧", implemented: true },
  { ext: "yaml", mime: "text/yaml", label: "YAML", icon: "⚙️", implemented: true },
  { ext: "yml", mime: "text/yaml", label: "YAML", icon: "⚙️", implemented: true },
  { ext: "toml", mime: "application/toml", label: "TOML", icon: "⚙️", implemented: true },
  { ext: "xml", mime: "application/xml", label: "XML", icon: "🔧", implemented: true },

  // Розмітка
  { ext: "rst", mime: "text/x-rst", label: "reStructuredText", icon: "📝", implemented: true },
  { ext: "adoc", mime: "text/asciidoc", label: "AsciiDoc", icon: "📝", implemented: true },
  { ext: "tex", mime: "application/x-latex", label: "LaTeX", icon: "📐", implemented: true },

  // Книги
  { ext: "epub", mime: "application/epub+zip", label: "EPUB", icon: "📚", implemented: true },

  // Текст
  { ext: "txt", mime: "text/plain", label: "Текст", icon: "📝", implemented: true },
];

/** Every format Markdown can be converted INTO. */
export const FROM_MARKDOWN_FORMATS: TargetFormat[] = [
  { ext: "html", label: "HTML", icon: "🌐", description: "Веб-сторінка", implemented: true },
  { ext: "txt", label: "Текст", icon: "📝", description: "Простий текст", implemented: true },
  { ext: "pdf", label: "PDF", icon: "📕", description: "Документ PDF", implemented: true },
  { ext: "docx", label: "Word (.docx)", icon: "📄", description: "Microsoft Word", implemented: true },
  { ext: "rst", label: "reStructuredText", icon: "📝", description: "Sphinx docs", implemented: true },
  { ext: "json", label: "JSON", icon: "🔧", description: "JSON-структура", implemented: true },
  { ext: "csv", label: "CSV", icon: "📊", description: "Лише таблиці", implemented: true },
  { ext: "epub", label: "EPUB", icon: "📚", description: "Електронна книга", implemented: true },
];

/** The Markdown format itself (the universal hub). */
export const MARKDOWN_FORMAT = {
  ext: "md",
  mime: "text/markdown",
  label: "Markdown",
  icon: "⬇️",
} as const;

/** Extensions accepted by the uploader (any source format OR markdown). */
export const ACCEPTED_SOURCE_EXTS: string[] = [
  ...TO_MARKDOWN_FORMATS.map((f) => f.ext),
  "md",
  "markdown",
];

/** Look up a source format definition by extension. */
export function findSourceFormat(ext: string): SourceFormat | undefined {
  return TO_MARKDOWN_FORMATS.find((f) => f.ext === ext.toLowerCase());
}

/** Is this extension a Markdown file? */
export function isMarkdownExt(ext: string): boolean {
  const e = ext.toLowerCase();
  return e === "md" || e === "markdown";
}
