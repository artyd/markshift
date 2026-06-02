import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { marked, type Token, type Tokens } from "marked";
import matter from "gray-matter";
import type { Converter } from "@/types/conversion";
import {
  LIBERATION_SANS_REGULAR_B64,
  LIBERATION_SANS_BOLD_B64,
} from "./fonts/liberationSans";

const FONT = "LiberationSans";

/** Register the vendored Cyrillic-capable font on a jsPDF instance. */
function registerFont(doc: jsPDF): void {
  doc.addFileToVFS("LiberationSans-Regular.ttf", LIBERATION_SANS_REGULAR_B64);
  doc.addFont("LiberationSans-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("LiberationSans-Bold.ttf", LIBERATION_SANS_BOLD_B64);
  doc.addFont("LiberationSans-Bold.ttf", FONT, "bold");
  doc.setFont(FONT, "normal");
}

/** Flatten inline markdown tokens to plain text for PDF rendering. */
function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((t) => {
      if ("tokens" in t && Array.isArray(t.tokens) && t.tokens.length) return inlineText(t.tokens);
      if (t.type === "br") return "\n";
      return "text" in t && typeof t.text === "string" ? t.text : "";
    })
    .join("");
}

const HEADING_SIZE = [22, 18, 15, 13, 12, 11];

export const markdownToPdf: Converter = async (input) => {
  const { content } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  registerFont(doc);

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeLines = (text: string, size: number, bold: boolean, gap: number) => {
    if (!text.trim()) return;
    doc.setFont(FONT, bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lineH = size * 1.35;
    for (const line of doc.splitTextToSize(text, maxW) as string[]) {
      ensure(lineH);
      doc.text(line, margin, y);
      y += lineH;
    }
    y += gap;
  };

  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const h = token as Tokens.Heading;
        writeLines(inlineText(h.tokens), HEADING_SIZE[Math.min(h.depth, 6) - 1], true, 6);
        break;
      }
      case "paragraph":
        writeLines(inlineText((token as Tokens.Paragraph).tokens), 11, false, 8);
        break;
      case "blockquote":
        writeLines(inlineText((token as Tokens.Blockquote).tokens), 11, false, 8);
        break;
      case "list": {
        const list = token as Tokens.List;
        let i = 1;
        for (const item of list.items) {
          const marker = list.ordered ? `${i}. ` : "•  ";
          writeLines(marker + inlineText(item.tokens), 11, false, 2);
          i += 1;
        }
        y += 6;
        break;
      }
      case "code": {
        const lines = (token as Tokens.Code).text.split("\n");
        doc.setFont(FONT, "normal");
        doc.setFontSize(9.5);
        for (const line of lines) {
          ensure(13);
          doc.text(line, margin + 6, y);
          y += 13;
        }
        y += 8;
        break;
      }
      case "table": {
        const t = token as Tokens.Table;
        ensure(40);
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [t.header.map((c) => inlineText(c.tokens))],
          body: t.rows.map((row) => row.map((c) => inlineText(c.tokens))),
          styles: { font: FONT, fontSize: 9 },
          headStyles: { font: FONT, fontStyle: "bold", fillColor: [29, 35, 48] },
        });
        const after = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
        y = (after?.finalY ?? y) + 12;
        break;
      }
      case "hr":
        ensure(12);
        doc.setDrawColor(200);
        doc.line(margin, y, pageW - margin, y);
        y += 12;
        break;
      default:
        break;
    }
  }

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return { content: buffer, mime: "application/pdf", ext: "pdf" };
};
