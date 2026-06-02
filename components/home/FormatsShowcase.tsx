"use client";

import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  TO_MARKDOWN_FORMATS,
  FROM_MARKDOWN_FORMATS,
} from "@/lib/constants/formats";

/** Short technical note shown in the tooltip for a given extension. */
const DETAILS: Record<string, string> = {
  docx: "Через mammoth — зберігає заголовки, списки й таблиці.",
  doc: "Старий формат Word 97–2003 через word-extractor.",
  pdf: "Витяг текстового шару (pdf-parse); скани — OCR ukr+eng (tesseract.js).",
  odt: "OpenDocument Text — розпаковка та витяг XML-вмісту.",
  rtf: "Rich Text через @iarna/rtf-to-html → Markdown.",
  html: "Очищення розмітки та конвертація в чистий Markdown.",
  csv: "Таблиця CSV → GitHub-таблиця Markdown.",
  xlsx: "Аркуші Excel через xlsx → таблиці Markdown.",
  xls: "Excel 97–2003 через xlsx → таблиці Markdown.",
  pptx: "Текст слайдів PowerPoint → заголовки та списки.",
  json: "Структуровані дані як вкладені списки/блоки коду.",
  yaml: "YAML як структуровані списки.",
  toml: "TOML через smol-toml → структуровані списки.",
  xml: "XML через fast-xml-parser → ієрархічні списки.",
  rst: "reStructuredText через restructured.",
  adoc: "AsciiDoc через asciidoctor.",
  tex: "LaTeX — витяг тексту та базової структури.",
  epub: "Розпаковка глав EPUB через jszip.",
  txt: "Простий текст із збереженням абзаців.",
  // from-markdown
  "to-html": "Рендер через marked + санітизація sanitize-html.",
  "to-pdf": "Генерація PDF через jspdf.",
  "to-docx": "Документ Word через бібліотеку docx.",
  "to-json": "Структура документа у вигляді JSON.",
  "to-csv": "Витяг таблиць Markdown у CSV.",
  "to-epub": "Електронна книга EPUB.",
  "to-rst": "reStructuredText для Sphinx-документації.",
  "to-txt": "Markdown без розмітки — чистий текст.",
};

function FormatRow({
  icon,
  label,
  ext,
  detailKey,
  accent,
}: {
  icon: string;
  label: string;
  ext: string;
  detailKey: string;
  accent: "primary" | "accent";
}) {
  const detail = DETAILS[detailKey] ?? "";
  const badgeClass =
    accent === "primary"
      ? "bg-primary/15 text-primary"
      : "bg-accent/15 text-accent";

  const row = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40"
    >
      <span
        className={`flex w-16 shrink-0 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${badgeClass}`}
      >
        {icon} {ext.toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
    </motion.div>
  );

  if (!detail) return row;
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="cursor-help" />}>{row}</TooltipTrigger>
      <TooltipContent side="top">{detail}</TooltipContent>
    </Tooltip>
  );
}

export function FormatsShowcase() {
  // De-duplicate aliases (htm/yml) for display.
  const sources = TO_MARKDOWN_FORMATS.filter(
    (f) => f.implemented && !["htm", "yml"].includes(f.ext),
  );
  const targets = FROM_MARKDOWN_FORMATS.filter((f) => f.implemented);

  return (
    <section id="formats" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="text-center text-3xl font-bold">Підтримувані формати</h2>
      <p className="mt-2 text-center text-muted-foreground">
        Markdown — універсальний центр. Наведіть на формат, щоб дізнатися деталі.
      </p>

      <TooltipProvider delay={200}>
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary">→ У Markdown</h3>
            <div className="flex flex-col gap-2">
              {sources.map((f) => (
                <FormatRow
                  key={f.ext}
                  icon={f.icon}
                  label={f.label}
                  ext={f.ext}
                  detailKey={f.ext}
                  accent="primary"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-accent">Із Markdown →</h3>
            <div className="flex flex-col gap-2">
              {targets.map((f) => (
                <FormatRow
                  key={f.ext}
                  icon={f.icon}
                  label={f.label}
                  ext={f.ext}
                  detailKey={`to-${f.ext}`}
                  accent="accent"
                />
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </section>
  );
}
