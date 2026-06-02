import JSZip from "jszip";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";

/** Decode the basic XML entities that appear in DrawingML text runs. */
function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Extract paragraph lines from one slide's XML by reading <a:p>/<a:t> runs. */
function slideToLines(xml: string): string[] {
  const lines: string[] = [];
  const paragraphs = xml.split("</a:p>");
  for (const para of paragraphs) {
    const runs = [...para.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => decodeXml(m[1]));
    const line = runs.join("").trim();
    if (line) lines.push(line);
  }
  return lines;
}

/**
 * Converter: PPTX → Markdown.
 * Reads each slide's XML from the OOXML package and extracts text runs.
 * The first line of a slide becomes its `## Слайд N` body's lead paragraph.
 */
export const pptxToMarkdown: Converter = async (input) => {
  const zip = await JSZip.loadAsync(input);

  const slideFiles = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
      return na - nb;
    });

  if (slideFiles.length === 0) {
    return {
      content: "_У презентації не знайдено слайдів._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Слайди не виявлено — можливо, файл не є валідним PPTX."],
    };
  }

  const warnings: string[] = [];
  const sections: string[] = [];
  let totalLines = 0;
  let n = 0;
  for (const file of slideFiles) {
    n += 1;
    const xml = await zip.files[file].async("string");
    const lines = slideToLines(xml);
    totalLines += lines.length;
    sections.push(`## Слайд ${n}`);
    sections.push(lines.length ? lines.join("\n\n") : "_Немає тексту._");
  }

  if (totalLines === 0) {
    warnings.push("У слайдах не знайдено текстового вмісту.");
  }

  return {
    content: cleanMarkdown(sections.join("\n\n")),
    mime: "text/markdown",
    ext: "md",
    warnings: warnings.length ? warnings : undefined,
  };
};
