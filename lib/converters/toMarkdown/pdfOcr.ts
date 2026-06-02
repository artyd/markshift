import "./pdfPolyfill";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";

/** Result of running OCR over a scanned PDF. */
export interface OcrResult {
  markdown: string;
  pages: number;
}

/**
 * Render every page of a (text-less) PDF to a PNG and OCR it with Tesseract
 * in Ukrainian + English. Pages are processed sequentially — concurrent pdfjs
 * document loads detach the same source ArrayBuffer and fail (see pdfToMd).
 *
 * The first invocation is slow: Tesseract downloads its language data.
 */
export async function ocrPdf(input: Buffer): Promise<OcrResult> {
  const parser = new PDFParse({ data: new Uint8Array(input) });
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    const shots = await parser.getScreenshot({ scale: 2 });
    if (shots.pages.length === 0) return { markdown: "", pages: 0 };

    worker = await createWorker("ukr+eng");
    const sections: string[] = [];
    for (const page of shots.pages) {
      const {
        data: { text },
      } = await worker.recognize(Buffer.from(page.data));
      const clean = text.trim();
      sections.push(`## Сторінка ${page.pageNumber}\n\n${clean || "_Текст не розпізнано._"}`);
    }

    return {
      markdown: cleanMarkdown(sections.join("\n\n")),
      pages: shots.total,
    };
  } finally {
    await parser.destroy();
    if (worker) await worker.terminate();
  }
}
