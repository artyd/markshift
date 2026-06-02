interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
  /** Reserved for callers that hid the old `.md` glyph; no-op in this mark. */
  hideLabel?: boolean;
}

/**
 * MarkShift brand mark: a rounded gradient tile holding a bold `M` with a
 * forward conversion arrow, expressing "shift to Markdown". Theme-neutral —
 * the vivid gradient reads on both light and dark backgrounds.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="MarkShift"
      className={className}
    >
      <defs>
        <linearGradient id="ms-tile" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="hsl(199 89% 52%)" />
          <stop offset="1" stopColor="hsl(265 84% 60%)" />
        </linearGradient>
      </defs>

      {/* Rounded gradient tile */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ms-tile)" />

      {/* Bold "M" letterform */}
      <path
        d="M13 33 V16 L21 27 L29 16 V33"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Forward conversion arrow */}
      <g
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M30 24 H38" />
        <path d="M34 20 L39 24 L34 28" />
      </g>
    </svg>
  );
}
