import { parse } from "csv-parse/sync";
import type { Converter } from "@/types/conversion";
import { LIMITS } from "@/lib/constants/limits";
import { rowsToMarkdownTable } from "@/lib/utils/markdownTable";

/**
 * Converter: CSV → Markdown GFM table.
 * First row is treated as the header.
 */
export const csvToMarkdown: Converter = async (input) => {
  const text = input.toString("utf-8");
  const rows = parse(text, {
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  }) as string[][];

  if (rows.length === 0) {
    return { content: "_Порожній CSV-файл._\n", mime: "text/markdown", ext: "md" };
  }

  const warnings: string[] = [];
  let dataRows = rows;
  if (rows.length - 1 > LIMITS.MAX_ROWS_CSV) {
    dataRows = rows.slice(0, LIMITS.MAX_ROWS_CSV + 1);
    warnings.push(`Таблицю обрізано до ${LIMITS.MAX_ROWS_CSV} рядків.`);
  }

  const colCount = dataRows[0].length;
  const summary = `*Таблиця: ${dataRows.length - 1} рядків × ${colCount} стовпців*\n\n`;
  return {
    content: summary + rowsToMarkdownTable(dataRows) + "\n",
    mime: "text/markdown",
    ext: "md",
    warnings: warnings.length ? warnings : undefined,
  };
};
