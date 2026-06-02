/**
 * Normalise messy Markdown produced by upstream converters:
 * collapse runs of blank lines, trim trailing whitespace, ensure a
 * single trailing newline.
 */
export function cleanMarkdown(md: string): string {
  return (
    md
      // Normalise line endings.
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Trim trailing whitespace on each line.
      .replace(/[ \t]+$/gm, "")
      // Collapse 3+ blank lines into a single blank line.
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

/** Build a YAML frontmatter block from a flat record of metadata. */
export function buildFrontmatter(meta: Record<string, string | number | undefined>): string {
  const entries = Object.entries(meta).filter(([, v]) => v !== undefined && v !== "");
  if (entries.length === 0) return "";
  const lines = entries.map(([k, v]) => {
    const value = typeof v === "string" && /[:#"']/.test(v) ? JSON.stringify(v) : String(v);
    return `${k}: ${value}`;
  });
  return `---\n${lines.join("\n")}\n---\n\n`;
}
