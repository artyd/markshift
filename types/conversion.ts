/** Options that tweak how a conversion is performed. */
export interface ConversionOptions {
  /** Render GFM tables in one of several styles (only "github" is wired up). */
  tableStyle?: "github" | "simple" | "grid";
  /** Prepend a YAML frontmatter block with source metadata. */
  includeMetadata?: boolean;
  /** Keep code highlighting hints where the source provides them. */
  codeHighlight?: boolean;
}

/** Successful conversion payload returned by POST /api/convert. */
export interface ConversionSuccess {
  success: true;
  /** Suggested download filename, e.g. "report.md". */
  filename: string;
  /** MIME type of the produced file. */
  mimeType: string;
  /** Size of the produced content in bytes. */
  size: number;
  /** How `content` is encoded: UTF-8 text or base64 for binary outputs. */
  encoding: "utf-8" | "base64";
  /** Produced content: raw text, or base64 string for binary outputs. */
  content: string;
  /** First ~4000 chars for quick preview. Absent for binary outputs. */
  preview?: string;
  /** Wall-clock processing time in milliseconds. */
  processingTime: number;
  /** Non-fatal warnings surfaced to the user. */
  warnings?: string[];
}

export type ConversionErrorCode =
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FORMAT"
  | "CONVERSION_FAILED"
  | "INVALID_FILE"
  | "TIMEOUT";

/** Error payload returned by POST /api/convert. */
export interface ConversionError {
  success: false;
  error: string;
  code: ConversionErrorCode;
}

export type ConversionResponse = ConversionSuccess | ConversionError;

/** Shape every converter function returns. */
export interface ConverterResult {
  /** Produced content: a string for text outputs, a Buffer for binary ones. */
  content: string | Buffer;
  /** MIME type of the produced content. */
  mime: string;
  /** Extension (no dot) of the produced file. */
  ext: string;
  warnings?: string[];
}

/** A converter takes raw input plus options and returns a result. */
export type Converter = (
  input: Buffer,
  options: ConversionOptions,
  meta: { filename: string },
) => Promise<ConverterResult>;
