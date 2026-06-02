import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy Node-only libraries out of the bundler (Next 15+ top-level key).
  serverExternalPackages: [
    "mammoth",
    "pdf-parse",
    "@napi-rs/canvas",
    "xlsx",
    "jszip",
    "docx",
    "jspdf",
    "asciidoctor",
    "tesseract.js",
    "word-extractor",
    "restructured",
    "@iarna/rtf-to-html",
    "fast-xml-parser",
    "smol-toml",
  ],
};

export default nextConfig;
