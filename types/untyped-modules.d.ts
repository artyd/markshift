declare module "word-extractor" {
  interface WordDocument {
    getBody(): string;
    getFootnotes(): string;
    getEndnotes(): string;
    getHeaders(): string;
    getFooters(): string;
  }
  class WordExtractor {
    extract(input: string | Buffer): Promise<WordDocument>;
  }
  export = WordExtractor;
}

declare module "@iarna/rtf-to-html" {
  type Callback = (err: Error | null, html: string) => void;
  interface RtfToHtml {
    fromString(rtf: string, options: Record<string, unknown>, cb: Callback): void;
    fromString(rtf: string, cb: Callback): void;
  }
  const rtfToHTML: RtfToHtml;
  export = rtfToHTML;
}

declare module "restructured" {
  interface RstNode {
    type: string;
    value?: string;
    children?: RstNode[];
    [key: string]: unknown;
  }
  interface Restructured {
    parse(input: string, options?: Record<string, unknown>): RstNode;
    default?: Restructured;
  }
  const restructured: Restructured;
  export default restructured;
}
