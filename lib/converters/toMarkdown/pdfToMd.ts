import "./pdfPolyfill";
import { PDFParse } from "pdf-parse";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown, buildFrontmatter } from "@/lib/utils/markdownCleaner";
import { getBaseName } from "@/lib/utils/fileDetector";
import { ocrPdf } from "./pdfOcr";

/**
 * Converter: PDF → Markdown.
 * Extracts the embedded text layer (pdf-parse v2). Scanned PDFs without a
 * text layer yield empty output and surface a warning.
 *
 * getText() and getInfo() MUST run sequentially: pdfjs transfers (detaches) the
 * source ArrayBuffer when loading the document, so two concurrent load() calls
 * race to transfer the same buffer and fail with "Unable to deserialize cloned data".
 */
export const pdfToMarkdown: Converter = async (input, options, meta) => {
  const parser = new PDFParse({ data: new Uint8Array(input) });
  try {
    const text = await parser.getText();
    const info = await parser.getInfo();
    const warnings: string[] = [];

    let body = cleanMarkdown(text.text ?? "");
    if (body.trim().length === 0) {
      // No text layer — likely a scanned document. Fall back to OCR.
      try {
        const ocr = await ocrPdf(input);
        if (ocr.markdown.trim().length > 0) {
          body = ocr.markdown;
          warnings.push("Текст розпізнано через OCR (ukr+eng) — можливі неточності.");
        } else {
          body = "_У PDF не знайдено тексту навіть після OCR._\n";
          warnings.push("OCR не зміг розпізнати текст у документі.");
        }
      } catch {
        body =
          "_У PDF не знайдено текстового шару. Імовірно, це сканований документ — потрібен OCR._\n";
        warnings.push("PDF не містить тексту (можливо, скан), а OCR завершився помилкою.");
      }
    }

    if (options.includeMetadata) {
      const docInfo = (info.info ?? {}) as Record<string, unknown>;
      const frontmatter = buildFrontmatter({
        title: (docInfo.Title as string) || getBaseName(meta.filename),
        author: docInfo.Author as string,
        pages: text.total,
        source: "pdf",
        converted: new Date().toISOString().slice(0, 10),
      });
      body = frontmatter + body;
    }

    return {
      content: body,
      mime: "text/markdown",
      ext: "md",
      warnings: warnings.length ? warnings : undefined,
    };
  } finally {
    await parser.destroy();
  }
};
