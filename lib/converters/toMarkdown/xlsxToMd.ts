import * as XLSX from "xlsx";
import type { Converter } from "@/types/conversion";
import { LIMITS } from "@/lib/constants/limits";
import { rowsToMarkdownTable } from "@/lib/utils/markdownTable";

/**
 * Converter: XLSX/XLS → Markdown.
 * Each worksheet becomes a `## {name}` heading followed by a GFM table.
 */
export const xlsxToMarkdown: Converter = async (input) => {
  const wb = XLSX.read(input, { type: "buffer" });
  if (wb.SheetNames.length === 0) {
    return { content: "_Книга не містить аркушів._\n", mime: "text/markdown", ext: "md" };
  }

  const warnings: string[] = [];
  const sections: string[] = [];

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });

    sections.push(`## ${name}`);
    if (rows.length === 0) {
      sections.push("_Порожній аркуш._");
      continue;
    }

    let dataRows = rows;
    if (rows.length - 1 > LIMITS.MAX_ROWS_CSV) {
      dataRows = rows.slice(0, LIMITS.MAX_ROWS_CSV + 1);
      warnings.push(`Аркуш «${name}» обрізано до ${LIMITS.MAX_ROWS_CSV} рядків.`);
    }
    sections.push(rowsToMarkdownTable(dataRows));
  }

  return {
    content: sections.join("\n\n") + "\n",
    mime: "text/markdown",
    ext: "md",
    warnings: warnings.length ? warnings : undefined,
  };
};
