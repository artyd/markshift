import type { NextRequest } from "next/server";
import type {
  ConversionError,
  ConversionOptions,
  ConversionResponse,
} from "@/types/conversion";
import { LIMITS } from "@/lib/constants/limits";
import { getExtension, getBaseName } from "@/lib/utils/fileDetector";
import { resolveConverter } from "@/lib/utils/conversionRouter";
import { isMarkdownExt } from "@/lib/constants/formats";

// Conversion uses Node-only libraries (mammoth, jsdom) → force Node runtime.
export const runtime = "nodejs";
// Allow long-running conversions (PDF OCR downloads language data on first run).
// Capped at 60s to fit the Vercel Hobby tier limit.
export const maxDuration = 60;

function fail(error: string, code: ConversionError["code"], status: number): Response {
  return Response.json({ success: false, error, code } satisfies ConversionError, { status });
}

/** Reject a promise if it does not settle within `ms` milliseconds. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const started = Date.now();

  // 1. Parse multipart form data.
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("Не вдалося прочитати дані форми.", "INVALID_FILE", 400);
  }

  const file = formData.get("file");
  const targetFormat = String(formData.get("targetFormat") ?? "").toLowerCase();
  const rawOptions = formData.get("options");

  if (!(file instanceof File)) {
    return fail("Файл не надано.", "INVALID_FILE", 400);
  }
  if (!targetFormat) {
    return fail("Не вказано цільовий формат.", "UNSUPPORTED_FORMAT", 400);
  }

  // 2. Validate size.
  if (file.size > LIMITS.MAX_FILE_SIZE) {
    return fail(
      `Файл завеликий. Максимум ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ.`,
      "FILE_TOO_LARGE",
      413,
    );
  }
  if (file.size === 0) {
    return fail("Файл порожній.", "INVALID_FILE", 400);
  }

  // 3. Resolve converter from (source ext → target ext).
  const sourceExt = getExtension(file.name);
  if (!sourceExt) {
    return fail("Не вдалося визначити тип файлу за розширенням.", "INVALID_FILE", 400);
  }
  const converter = resolveConverter(sourceExt, targetFormat);
  if (!converter) {
    return fail(
      `Конвертація ${sourceExt.toUpperCase()} → ${targetFormat.toUpperCase()} ще не підтримується.`,
      "UNSUPPORTED_FORMAT",
      422,
    );
  }

  // 4. Parse optional conversion options.
  let options: ConversionOptions = {};
  if (typeof rawOptions === "string" && rawOptions) {
    try {
      options = JSON.parse(rawOptions) as ConversionOptions;
    } catch {
      // Ignore malformed options — fall back to defaults.
    }
  }

  // 5. Run conversion with a timeout. Files stay in memory only.
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // PDFs may fall back to OCR, which is much slower than other conversions.
    const timeout = sourceExt === "pdf" ? LIMITS.OCR_TIMEOUT : LIMITS.CONVERSION_TIMEOUT;
    const result = await withTimeout(
      converter(buffer, options, { filename: file.name }),
      timeout,
    );

    const base = getBaseName(file.name) || "converted";
    const outName = isMarkdownExt(targetFormat) ? `${base}.md` : `${base}.${result.ext}`;

    const isBinary = Buffer.isBuffer(result.content);
    const response: ConversionResponse = isBinary
      ? {
          success: true,
          filename: outName,
          mimeType: result.mime,
          size: result.content.length,
          encoding: "base64",
          content: (result.content as Buffer).toString("base64"),
          processingTime: Date.now() - started,
          warnings: result.warnings,
        }
      : {
          success: true,
          filename: outName,
          mimeType: result.mime,
          size: Buffer.byteLength(result.content as string, "utf-8"),
          encoding: "utf-8",
          content: result.content as string,
          preview: (result.content as string).slice(0, LIMITS.PREVIEW_CHARS),
          processingTime: Date.now() - started,
          warnings: result.warnings,
        };
    return Response.json(response);
  } catch (err) {
    // Never leak internals to the client.
    console.error("[convert] conversion failed:", err);
    if (err instanceof Error && err.message === "TIMEOUT") {
      return fail("Перевищено час конвертації. Спробуйте менший файл.", "TIMEOUT", 504);
    }
    return fail(
      "Не вдалося конвертувати файл. Можливо, він пошкоджений або має непідтримувану структуру.",
      "CONVERSION_FAILED",
      500,
    );
  }
}
