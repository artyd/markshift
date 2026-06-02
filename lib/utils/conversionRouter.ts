import type { Converter } from "@/types/conversion";
import { isMarkdownExt } from "@/lib/constants/formats";

import { docxToMarkdown } from "@/lib/converters/toMarkdown/docxToMd";
import { htmlToMarkdown } from "@/lib/converters/toMarkdown/htmlToMd";
import { txtToMarkdown } from "@/lib/converters/toMarkdown/txtToMd";
import { csvToMarkdown } from "@/lib/converters/toMarkdown/csvToMd";
import { jsonToMarkdown } from "@/lib/converters/toMarkdown/jsonToMd";
import { yamlToMarkdown } from "@/lib/converters/toMarkdown/yamlToMd";
import { pdfToMarkdown } from "@/lib/converters/toMarkdown/pdfToMd";
import { xlsxToMarkdown } from "@/lib/converters/toMarkdown/xlsxToMd";
import { pptxToMarkdown } from "@/lib/converters/toMarkdown/pptxToMd";
import { tomlToMarkdown } from "@/lib/converters/toMarkdown/tomlToMd";
import { xmlToMarkdown } from "@/lib/converters/toMarkdown/xmlToMd";
import { epubToMarkdown } from "@/lib/converters/toMarkdown/epubToMd";
import { odtToMarkdown } from "@/lib/converters/toMarkdown/odtToMd";
import { docToMarkdown } from "@/lib/converters/toMarkdown/docToMd";
import { rtfToMarkdown } from "@/lib/converters/toMarkdown/rtfToMd";
import { adocToMarkdown } from "@/lib/converters/toMarkdown/adocToMd";
import { rstToMarkdown } from "@/lib/converters/toMarkdown/rstToMd";
import { texToMarkdown } from "@/lib/converters/toMarkdown/texToMd";

import { markdownToHtml } from "@/lib/converters/fromMarkdown/mdToHtml";
import { markdownToTxt } from "@/lib/converters/fromMarkdown/mdToTxt";
import { markdownToDocx } from "@/lib/converters/fromMarkdown/mdToDocx";
import { markdownToPdf } from "@/lib/converters/fromMarkdown/mdToPdf";
import { markdownToJson } from "@/lib/converters/fromMarkdown/mdToJson";
import { markdownToCsv } from "@/lib/converters/fromMarkdown/mdToCsv";
import { markdownToRst } from "@/lib/converters/fromMarkdown/mdToRst";
import { markdownToEpub } from "@/lib/converters/fromMarkdown/mdToEpub";

/** Converters that turn a source file into Markdown, keyed by source ext. */
const TO_MARKDOWN: Record<string, Converter> = {
  docx: docxToMarkdown,
  doc: docToMarkdown,
  html: htmlToMarkdown,
  htm: htmlToMarkdown,
  txt: txtToMarkdown,
  csv: csvToMarkdown,
  json: jsonToMarkdown,
  yaml: yamlToMarkdown,
  yml: yamlToMarkdown,
  toml: tomlToMarkdown,
  xml: xmlToMarkdown,
  pdf: pdfToMarkdown,
  xlsx: xlsxToMarkdown,
  xls: xlsxToMarkdown,
  pptx: pptxToMarkdown,
  epub: epubToMarkdown,
  odt: odtToMarkdown,
  rtf: rtfToMarkdown,
  adoc: adocToMarkdown,
  rst: rstToMarkdown,
  tex: texToMarkdown,
};

/** Converters that turn Markdown into a target file, keyed by target ext. */
const FROM_MARKDOWN: Record<string, Converter> = {
  html: markdownToHtml,
  txt: markdownToTxt,
  docx: markdownToDocx,
  pdf: markdownToPdf,
  json: markdownToJson,
  csv: markdownToCsv,
  rst: markdownToRst,
  epub: markdownToEpub,
};

/**
 * Resolve the converter for a (source → target) pair, or null if the pair
 * is unsupported. Exactly one side must be Markdown.
 */
export function resolveConverter(sourceExt: string, targetExt: string): Converter | null {
  const src = sourceExt.toLowerCase();
  const tgt = targetExt.toLowerCase();

  if (!isMarkdownExt(src) && isMarkdownExt(tgt)) {
    return TO_MARKDOWN[src] ?? null;
  }
  if (isMarkdownExt(src) && !isMarkdownExt(tgt)) {
    return FROM_MARKDOWN[tgt] ?? null;
  }
  return null;
}
