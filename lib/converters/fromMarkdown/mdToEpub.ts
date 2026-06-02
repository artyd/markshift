import JSZip from "jszip";
import { randomUUID } from "node:crypto";
import type { Converter } from "@/types/conversion";
import { getBaseName } from "@/lib/utils/fileDetector";
import { markdownToHtmlBody } from "./mdToHtml";

/** Escape text for safe inclusion in XML/XHTML. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Make marked's HTML body XHTML-safe (self-close common void elements). */
function xhtmlify(html: string): string {
  return html
    .replace(/<(br|hr)\s*>/gi, "<$1/>")
    .replace(/(<img\b[^>]*?)\s*(?<!\/)>/gi, "$1/>");
}

/**
 * Converter: Markdown → EPUB3.
 * Builds a minimal single-chapter EPUB3 package by hand. The `mimetype`
 * entry is written first and uncompressed (STORE) so readers accept the file.
 */
export const markdownToEpub: Converter = async (input, _options, meta) => {
  const markdown = input.toString("utf-8");
  const title = getBaseName(meta.filename) || "Документ";
  const bodyHtml = xhtmlify(markdownToHtmlBody(markdown));
  const uuid = randomUUID();
  const modified = new Date().toISOString().replace(/\.\d+Z$/, "Z");

  const zip = new JSZip();

  // 1. mimetype MUST be first and stored uncompressed.
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. container.xml points at the OPF package document.
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  // 3. OPF manifest + spine.
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${uuid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>uk</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="chapter"/>
  </spine>
</package>`,
  );

  // 4. EPUB3 navigation document.
  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="uk">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Зміст</h1>
    <ol><li><a href="chapter.xhtml">${escapeXml(title)}</a></li></ol>
  </nav>
</body>
</html>`,
  );

  // 5. The chapter content.
  zip.file(
    "OEBPS/chapter.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="uk">
<head><meta charset="utf-8"/><title>${escapeXml(title)}</title></head>
<body>
${bodyHtml}
</body>
</html>`,
  );

  const content = await zip.generateAsync({ type: "nodebuffer", mimeType: "application/epub+zip" });

  return {
    content,
    mime: "application/epub+zip",
    ext: "epub",
  };
};
