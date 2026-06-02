/**
 * pdf-parse v2 loads pdfjs, which references DOM globals (DOMMatrix, Path2D, …)
 * at module scope. They are absent in the Node server runtime, so importing
 * pdf-parse throws "DOMMatrix is not defined". Install them from @napi-rs/canvas
 * (already a dependency) before pdf-parse is required.
 *
 * Import this module FIRST in any file that imports "pdf-parse".
 */
import {
  DOMMatrix,
  DOMPoint,
  ImageData,
  Path2D,
} from "@napi-rs/canvas";

const g = globalThis as Record<string, unknown>;
g.DOMMatrix ??= DOMMatrix;
g.DOMPoint ??= DOMPoint;
g.ImageData ??= ImageData;
g.Path2D ??= Path2D;
