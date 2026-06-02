/** Escape a value so it is safe inside a Markdown table cell. */
export function escapeCell(value: unknown): string {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

/**
 * Render rows of arbitrary values into a GFM table.
 * The first row is treated as the header; ragged rows are padded/truncated
 * to the header width. Returns an empty string for empty input.
 */
export function rowsToMarkdownTable(rows: unknown[][]): string {
  if (rows.length === 0) return "";

  const colCount = Math.max(...rows.map((r) => r.length), 1);
  const header = rows[0];
  const body = rows.slice(1);

  const lines: string[] = [];
  const headerCells = Array.from({ length: colCount }, (_, i) => escapeCell(header[i]));
  lines.push(`| ${headerCells.join(" | ")} |`);
  lines.push(`| ${Array(colCount).fill("---").join(" | ")} |`);
  for (const row of body) {
    const cells = Array.from({ length: colCount }, (_, i) => escapeCell(row[i]));
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines.join("\n");
}
