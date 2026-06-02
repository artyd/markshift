import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brandMark";

export const alt = "MarkShift — universal file to Markdown converter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCES = ["PDF", "DOCX", "XLSX", "HTML"];
const TARGETS = ["PDF", "DOCX", "HTML", "JSON"];

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "8px 18px",
        borderRadius: 999,
        border: `2px solid ${color}`,
        color: "#e5e9f0",
        fontSize: 28,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 120% at 20% 0%, #16203a 0%, #0c0f17 55%)",
          color: "#e5e9f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brandMarkDataUri({ size: 96 })} width={96} height={96} alt="" />
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800 }}>
            <span>Mark</span>
            <span
              style={{
                background: "linear-gradient(135deg, #3cc5ec, #b07cf0)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Shift
            </span>
          </div>
        </div>

        <div style={{ fontSize: 34, color: "#9aa4b2", marginBottom: 44 }}>
          Convert anything to Markdown — and back
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {SOURCES.map((s) => (
            <Pill key={`s-${s}`} label={s} color="#3cc5ec" />
          ))}
          <div style={{ display: "flex", fontSize: 40, color: "#3cc5ec", padding: "0 6px" }}>
            → .md →
          </div>
          {TARGETS.map((t) => (
            <Pill key={`t-${t}`} label={t} color="#b07cf0" />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
