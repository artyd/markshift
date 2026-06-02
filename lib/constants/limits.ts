/** Hard limits applied on both client and server. */
export const LIMITS = {
  /** Maximum upload size: 50 MB. */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  /** Maximum rows parsed from a CSV before truncation. */
  MAX_ROWS_CSV: 100_000,
  /** Conversion timeout in milliseconds. */
  CONVERSION_TIMEOUT: 30_000,
  /**
   * Longer timeout for PDF (may trigger OCR, which downloads language data).
   * Kept just under the 60s Vercel Hobby function limit so our in-code timeout
   * fires before the platform kills the request.
   */
  OCR_TIMEOUT: 55_000,
  /** Characters of output included in the preview field. */
  PREVIEW_CHARS: 4000,
} as const;
