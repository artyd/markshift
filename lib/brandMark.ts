/**
 * The MarkShift brand mark as a standalone SVG string — used to embed the logo
 * inside `next/og` ImageResponse (Satori renders it via an <img> data URI).
 * Mirrors components/Logo.tsx but without the `.md` text glyph so it stays
 * crisp at favicon sizes.
 */
export function brandMarkSvg({
  size = 48,
  background = true,
}: { size?: number; background?: boolean } = {}): string {
  const bg = background
    ? `<rect x="1" y="1" width="46" height="46" rx="11" fill="hsl(220 18% 9%)"/>
       <rect x="1" y="1" width="46" height="46" rx="11" fill="none" stroke="hsl(220 15% 18%)" stroke-width="1.5"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="msc" x1="0" y1="0" x2="48" y2="48">
      <stop offset="0" stop-color="hsl(195 85% 60%)"/>
      <stop offset="1" stop-color="hsl(195 85% 45%)"/>
    </linearGradient>
    <linearGradient id="msv" x1="48" y1="0" x2="0" y2="48">
      <stop offset="0" stop-color="hsl(275 70% 70%)"/>
      <stop offset="1" stop-color="hsl(275 70% 55%)"/>
    </linearGradient>
  </defs>
  ${bg}
  <g stroke="url(#msc)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M11 18 H33"/>
    <path d="M27 12 L34 18 L27 24"/>
  </g>
  <g stroke="url(#msv)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M37 30 H15"/>
    <path d="M21 24 L14 30 L21 36"/>
  </g>
</svg>`;
}

/** Data-URI form for `<img src>` inside Satori. */
export function brandMarkDataUri(opts?: { size?: number; background?: boolean }): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(brandMarkSvg(opts))}`;
}
