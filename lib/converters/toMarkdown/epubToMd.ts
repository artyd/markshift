import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown, buildFrontmatter } from "@/lib/utils/markdownCleaner";
import { getBaseName } from "@/lib/utils/fileDetector";
import { htmlStringToMarkdown } from "./htmlToMd";

/** Normalise fast-xml-parser output (single object OR array) to an array. */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Resolve a spine href against the OPF directory and normalise the path. */
function resolveHref(opfDir: string, href: string): string {
  const clean = decodeURIComponent(href.split("#")[0]);
  const joined = opfDir ? `${opfDir}/${clean}` : clean;
  const parts: string[] = [];
  for (const seg of joined.split("/")) {
    if (seg === "." || seg === "") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return parts.join("/");
}

/**
 * Converter: EPUB → Markdown.
 * Reads the OPF spine to recover chapter order, converts each XHTML document
 * via the shared Turndown pipeline, and joins chapters with a horizontal rule.
 */
export const epubToMarkdown: Converter = async (input, options, meta) => {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(input);
  } catch {
    return {
      content: "_Не вдалося відкрити EPUB (пошкоджений або не zip-архів)._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["EPUB не є валідним zip-архівом."],
    };
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const warnings: string[] = [];

  // 1. Locate the OPF package document via META-INF/container.xml.
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) {
    return {
      content: "_У EPUB відсутній META-INF/container.xml._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["Структура EPUB некоректна (немає container.xml)."],
    };
  }

  const container = parser.parse(await containerFile.async("string"));
  const rootfiles = toArray(container?.container?.rootfiles?.rootfile);
  const opfPath: string | undefined = rootfiles[0]?.["@_full-path"];
  const opfFile = opfPath ? zip.file(opfPath) : null;
  if (!opfPath || !opfFile) {
    return {
      content: "_Не знайдено OPF-маніфест EPUB._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: ["EPUB не містить OPF-файла, зазначеного у container.xml."],
    };
  }

  const opfDir = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/")) : "";
  const opf = parser.parse(await opfFile.async("string"));
  const pkg = opf?.package ?? {};

  // 2. Build id → href map from the manifest.
  const manifest = new Map<string, string>();
  for (const item of toArray(pkg.manifest?.item)) {
    if (item?.["@_id"] && item?.["@_href"]) manifest.set(item["@_id"], item["@_href"]);
  }

  // 3. Walk the spine to get chapter order.
  const spineRefs = toArray(pkg.spine?.itemref)
    .map((ref) => ref?.["@_idref"])
    .filter((id): id is string => Boolean(id));

  const hrefs = spineRefs
    .map((id) => manifest.get(id))
    .filter((h): h is string => Boolean(h));

  if (hrefs.length === 0) {
    warnings.push("У spine EPUB не знайдено глав — використано всі XHTML-файли.");
    for (const [, href] of manifest) {
      if (/\.x?html?$/i.test(href)) hrefs.push(href);
    }
  }

  // 4. Convert each chapter to Markdown.
  const chapters: string[] = [];
  for (const href of hrefs) {
    const path = resolveHref(opfDir, href);
    const file = zip.file(path);
    if (!file) continue;
    const html = await file.async("string");
    const md = htmlStringToMarkdown(html).trim();
    if (md) chapters.push(md);
  }

  if (chapters.length === 0) {
    return {
      content: "_У EPUB не знайдено текстового вмісту._\n",
      mime: "text/markdown",
      ext: "md",
      warnings: [...warnings, "Глави EPUB порожні або не розпізнані."],
    };
  }

  let body = cleanMarkdown(chapters.join("\n\n---\n\n"));

  if (options.includeMetadata) {
    const md = pkg.metadata ?? {};
    const title =
      (typeof md["dc:title"] === "object" ? md["dc:title"]?.["#text"] : md["dc:title"]) ||
      getBaseName(meta.filename);
    const author =
      (typeof md["dc:creator"] === "object" ? md["dc:creator"]?.["#text"] : md["dc:creator"]) ||
      undefined;
    const frontmatter = buildFrontmatter({
      title: String(title),
      author: author ? String(author) : undefined,
      chapters: chapters.length,
      source: "epub",
      converted: new Date().toISOString().slice(0, 10),
    });
    body = frontmatter + body;
  }

  return {
    content: body,
    mime: "text/markdown",
    ext: "md",
    warnings: warnings.length ? warnings : undefined,
  };
};
