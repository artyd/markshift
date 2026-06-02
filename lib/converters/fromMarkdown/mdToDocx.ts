import { marked, type Token, type Tokens } from "marked";
import matter from "gray-matter";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  LevelFormat,
  AlignmentType,
  type IParagraphOptions,
} from "docx";
import type { Converter } from "@/types/conversion";

const HEADING_BY_DEPTH = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

const NUM_REF = "md-ordered";

interface RunStyle {
  bold?: boolean;
  italics?: boolean;
  code?: boolean;
}

/** Flatten inline markdown tokens into styled docx TextRuns. */
function inlineToRuns(tokens: Token[] | undefined, style: RunStyle = {}): TextRun[] {
  if (!tokens) return [];
  const runs: TextRun[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case "strong":
        runs.push(...inlineToRuns((t as Tokens.Strong).tokens, { ...style, bold: true }));
        break;
      case "em":
        runs.push(...inlineToRuns((t as Tokens.Em).tokens, { ...style, italics: true }));
        break;
      case "del":
        runs.push(...inlineToRuns((t as Tokens.Del).tokens, style));
        break;
      case "link":
        runs.push(...inlineToRuns((t as Tokens.Link).tokens, style));
        break;
      case "codespan":
        runs.push(
          new TextRun({ text: (t as Tokens.Codespan).text, font: "Courier New", ...style }),
        );
        break;
      case "br":
        runs.push(new TextRun({ break: 1 }));
        break;
      default: {
        const text = "text" in t && typeof t.text === "string" ? t.text : "";
        if ("tokens" in t && Array.isArray(t.tokens) && t.tokens.length) {
          runs.push(...inlineToRuns(t.tokens, style));
        } else if (text) {
          runs.push(
            new TextRun({ text, bold: style.bold, italics: style.italics, font: style.code ? "Courier New" : undefined }),
          );
        }
      }
    }
  }
  return runs.length ? runs : [new TextRun("")];
}

/** Convert a marked list into docx paragraphs (supports one nesting level). */
function listToParagraphs(list: Tokens.List, level: number): Paragraph[] {
  const out: Paragraph[] = [];
  for (const item of list.items) {
    const opts: IParagraphOptions = list.ordered
      ? { numbering: { reference: NUM_REF, level } }
      : { bullet: { level } };
    const lead: Token[] = [];
    const nested: Tokens.List[] = [];
    for (const child of item.tokens) {
      if (child.type === "list") nested.push(child as Tokens.List);
      else if ("tokens" in child && Array.isArray(child.tokens)) lead.push(...child.tokens);
      else if (child.type === "text") lead.push(child);
    }
    out.push(new Paragraph({ ...opts, children: inlineToRuns(lead) }));
    for (const sub of nested) out.push(...listToParagraphs(sub, level + 1));
  }
  return out;
}

/** Convert a marked GFM table into a docx Table. */
function tableToDocx(token: Tokens.Table): Table {
  const headerRow = new TableRow({
    children: token.header.map(
      (cell) =>
        new TableCell({
          children: [new Paragraph({ children: inlineToRuns(cell.tokens) })],
        }),
    ),
  });
  const bodyRows = token.rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: inlineToRuns(cell.tokens) })],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
}

/** Convert top-level markdown tokens into docx block elements. */
function tokensToBlocks(tokens: Token[]): (Paragraph | Table)[] {
  const blocks: (Paragraph | Table)[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading": {
        const h = token as Tokens.Heading;
        blocks.push(
          new Paragraph({
            heading: HEADING_BY_DEPTH[Math.min(h.depth, 6) - 1],
            children: inlineToRuns(h.tokens),
          }),
        );
        break;
      }
      case "paragraph": {
        blocks.push(new Paragraph({ children: inlineToRuns((token as Tokens.Paragraph).tokens) }));
        break;
      }
      case "list":
        blocks.push(...listToParagraphs(token as Tokens.List, 0));
        break;
      case "code": {
        const lines = (token as Tokens.Code).text.split("\n");
        blocks.push(
          new Paragraph({
            shading: { fill: "F4F4F5" },
            children: lines.flatMap((line, i) => {
              const run = new TextRun({ text: line, font: "Courier New", size: 20 });
              return i === 0 ? [run] : [new TextRun({ break: 1, text: line, font: "Courier New", size: 20 })];
            }),
          }),
        );
        break;
      }
      case "blockquote": {
        const bq = token as Tokens.Blockquote;
        blocks.push(
          new Paragraph({
            alignment: AlignmentType.START,
            children: inlineToRuns(bq.tokens, { italics: true }),
            indent: { left: 480 },
          }),
        );
        break;
      }
      case "table":
        blocks.push(tableToDocx(token as Tokens.Table));
        break;
      case "hr":
        blocks.push(new Paragraph({ border: { bottom: { style: "single", size: 6, color: "CCCCCC" } }, children: [] }));
        break;
      case "space":
      default:
        break;
    }
  }
  return blocks;
}

/** Converter: Markdown → DOCX (binary). */
export const markdownToDocx: Converter = async (input) => {
  const { content } = matter(input.toString("utf-8"));
  const tokens = marked.lexer(content);
  const children = tokensToBlocks(tokens);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: NUM_REF,
          levels: [0, 1, 2].map((level) => ({
            level,
            format: LevelFormat.DECIMAL,
            text: `%${level + 1}.`,
            alignment: AlignmentType.START,
          })),
        },
      ],
    },
    sections: [{ children: children.length ? children : [new Paragraph({ children: [] })] }],
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    content: buffer,
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: "docx",
  };
};
