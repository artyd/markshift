import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import type { Converter } from "@/types/conversion";
import { cleanMarkdown } from "@/lib/utils/markdownCleaner";

/** Build a Turndown instance configured for GitHub-Flavored Markdown. */
export function createTurndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
  });
  service.use(gfm);
  // Drop non-content elements so their text (e.g. CSS) never leaks into Markdown.
  service.remove(["style", "script", "head", "title", "noscript"]);
  // Replace images that have no usable src with a readable placeholder.
  service.addRule("strippedImages", {
    filter: "img",
    replacement: (_content, node) => {
      const el = node as unknown as HTMLImageElement;
      const alt = el.getAttribute("alt") || "image";
      const src = el.getAttribute("src") || "";
      if (src.startsWith("data:") || src === "") return `![${alt}](embedded)`;
      return `![${alt}](${src})`;
    },
  });
  return service;
}

/** Convert an HTML string to clean Markdown. Shared by docxToMd. */
export function htmlStringToMarkdown(html: string): string {
  const service = createTurndown();
  return cleanMarkdown(service.turndown(html));
}

/** Converter: HTML file → Markdown. */
export const htmlToMarkdown: Converter = async (input) => {
  const html = input.toString("utf-8");
  return {
    content: htmlStringToMarkdown(html),
    mime: "text/markdown",
    ext: "md",
  };
};
