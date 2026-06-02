import JSZip from "jszip";

/** One converted output to include in the bundle. */
export interface BundleEntry {
  filename: string;
  content: string;
  encoding: "utf-8" | "base64";
}

/** Decode a base64 string to a byte array (browser-safe). */
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Ensure filenames are unique inside the archive (append " (2)", etc.). */
function uniqueName(name: string, seen: Set<string>): string {
  if (!seen.has(name)) {
    seen.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const base = dot === -1 ? name : name.slice(0, dot);
  const ext = dot === -1 ? "" : name.slice(dot);
  let n = 2;
  let candidate = `${base} (${n})${ext}`;
  while (seen.has(candidate)) {
    n += 1;
    candidate = `${base} (${n})${ext}`;
  }
  seen.add(candidate);
  return candidate;
}

/** Bundle converted outputs into a single .zip Blob. */
export async function buildZipBundle(entries: BundleEntry[]): Promise<Blob> {
  const zip = new JSZip();
  const seen = new Set<string>();
  for (const entry of entries) {
    const name = uniqueName(entry.filename, seen);
    if (entry.encoding === "base64") {
      zip.file(name, base64ToBytes(entry.content));
    } else {
      zip.file(name, entry.content);
    }
  }
  return zip.generateAsync({ type: "blob" });
}

/** Build the bundle and trigger a browser download. */
export async function downloadZipBundle(entries: BundleEntry[], zipName = "markshift.zip"): Promise<void> {
  const blob = await buildZipBundle(entries);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
