/** Extract the lowercase extension (no dot) from a filename. */
export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1 || dot === filename.length - 1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

/** Strip the extension from a filename, keeping the base name. */
export function getBaseName(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? filename : filename.slice(0, dot);
}
