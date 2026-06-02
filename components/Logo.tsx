interface LogoProps {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
  /** Hide the inner `.md` glyph (e.g. for tiny favicons). */
  hideLabel?: boolean;
}

/**
 * MarkShift brand mark: two crossing arrows — cyan pointing right (into .md),
 * violet pointing left (out of .md) — expressing bidirectional conversion,
 * with an `.md` glyph at the crossing. Drives Header, Footer, favicon and OG.
 */
export function Logo({ size = 32, className, hideLabel = false }: LogoProps) {
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
        <linearGradient id="ms-cyan" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="hsl(195 85% 60%)" />
          <stop offset="1" stopColor="hsl(195 85% 45%)" />
        </linearGradient>
        <linearGradient id="ms-violet" x1="48" y1="0" x2="0" y2="48">
          <stop offset="0" stopColor="hsl(275 70% 70%)" />
          <stop offset="1" stopColor="hsl(275 70% 55%)" />
        </linearGradient>
      </defs>

      {/* Rounded tile background */}
      <rect x="1" y="1" width="46" height="46" rx="11" fill="hsl(220 18% 9%)" />
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="11"
        fill="none"
        stroke="hsl(220 15% 18%)"
        strokeWidth="1.5"
      />

      {/* Cyan arrow → (top) */}
      <g
        stroke="url(#ms-cyan)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M11 18 H33" />
        <path d="M27 12 L34 18 L27 24" />
      </g>

      {/* Violet arrow ← (bottom) */}
      <g
        stroke="url(#ms-violet)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M37 30 H15" />
        <path d="M21 24 L14 30 L21 36" />
      </g>

      {!hideLabel && (
        <text
          x="24"
          y="44.5"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fill="hsl(210 20% 70%)"
        >
          .md
        </text>
      )}
    </svg>
  );
}
