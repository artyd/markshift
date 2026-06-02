import "./pdfPolyfill";
import PDFParser from "pdf2json";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown, buildFrontmatter } from "@/lib/utils/markdownCleaner";
import { getBaseName } from "@/lib/utils/fileDetector";
import { ocrPdf } from "./pdfOcr";

function extractTextFromPdf2Json(data: any): string {
  const pages: string[] = [];

  for (const page of data.Pages ?? []) {
    // Group text elements by rounded Y coordinate (each ~0.1 unit = one line)
    const lineMap = new Map<number, string[]>();

    for (const text of page.Texts ?? []) {
      const y = Math.round(text.y * 10);
      const decoded = (text.R ?? [])
        .map((r: any) => decodeURIComponent(r.T ?? ""))
        .join("");
      if (!decoded.trim()) continue;

      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push(decoded);
    }

    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => a - b);
    const lines = sortedYs.map(y => lineMap.get(y)!.join(" ").trim());
    pages.push(lines.join("\n"));
  }

  return pages.join("\n\n---\n\n");
}

export const pdfToMarkdown: Converter = async (input, options, meta) => {
  console.log("[pdfToMd] using pdf2json, buffer:", input.length);

  const text = await new Promise<string>((resolve, reject) => {
    const parser = new (PDFParser as any)(null, true);
    const timeout = setTimeout(
      () => reject(new Error("PDF parsing timeout after 25s")),
      25000,
    );

    parser.on("pdfParser_dataError", (err: any) => {
      clearTimeout(timeout);
      reject(new Error(`PDF parse error: ${err.parserError ?? "unknown"}`));
    });

    parser.on("pdfParser_dataReady", (data: any) => {
      clearTimeout(timeout);
      try {
        resolve(extractTextFromPdf2Json(data));
      } catch (e) {
        reject(e);
      }
    });

    parser.parseBuffer(Buffer.from(input));
  });

  const warnings: string[] = [];
  let body = cleanMarkdown(text);

  if (body.trim().length === 0) {
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
    const frontmatter = buildFrontmatter({
      title: getBaseName(meta.filename),
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
};
