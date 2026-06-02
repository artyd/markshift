"use client";

type CarouselItem = {
  icon: string;
  name: string;
  ext: string;
  color: string;
};

const ROW1: CarouselItem[] = [
  { icon: "📄", name: "Word", ext: "docx", color: "hsl(213 94% 95%)" },
  { icon: "📕", name: "PDF", ext: "pdf", color: "hsl(0 86% 96%)" },
  { icon: "🌐", name: "HTML", ext: "html", color: "hsl(25 95% 95%)" },
  { icon: "📊", name: "Excel", ext: "xlsx", color: "hsl(142 71% 94%)" },
  { icon: "📑", name: "CSV", ext: "csv", color: "hsl(160 84% 94%)" },
  { icon: "📽️", name: "PowerPoint", ext: "pptx", color: "hsl(14 91% 95%)" },
  { icon: "🧾", name: "JSON", ext: "json", color: "hsl(48 96% 93%)" },
  { icon: "⚙️", name: "YAML", ext: "yaml", color: "hsl(204 94% 94%)" },
  { icon: "📘", name: "EPUB", ext: "epub", color: "hsl(258 90% 95%)" },
  { icon: "📃", name: "RTF", ext: "rtf", color: "hsl(280 80% 96%)" },
  { icon: "🗂️", name: "ODT", ext: "odt", color: "hsl(188 86% 94%)" },
  { icon: "🔖", name: "XML", ext: "xml", color: "hsl(330 81% 96%)" },
];

const ROW2: CarouselItem[] = [
  { icon: "🌐", name: "HTML", ext: "html", color: "hsl(25 95% 95%)" },
  { icon: "📕", name: "PDF", ext: "pdf", color: "hsl(0 86% 96%)" },
  { icon: "📄", name: "Word", ext: "docx", color: "hsl(213 94% 95%)" },
  { icon: "📝", name: "Текст", ext: "txt", color: "hsl(210 40% 96%)" },
  { icon: "📐", name: "reST", ext: "rst", color: "hsl(258 90% 95%)" },
  { icon: "🧾", name: "JSON", ext: "json", color: "hsl(48 96% 93%)" },
  { icon: "📑", name: "CSV", ext: "csv", color: "hsl(160 84% 94%)" },
  { icon: "📘", name: "EPUB", ext: "epub", color: "hsl(142 71% 94%)" },
];

function FormatCard({ item }: { item: CarouselItem }) {
  return (
    <div
      className="fmt-card flex h-[100px] w-[140px] flex-none flex-col items-center justify-center gap-1.5 rounded-2xl transition-all"
      style={{ ["--tint" as string]: item.color }}
    >
      <span className="text-[28px] leading-none">{item.icon}</span>
      <span className="text-[13px] font-semibold text-foreground">
        {item.name}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">
        .{item.ext}
      </span>
    </div>
  );
}

function Row({
  items,
  direction,
}: {
  items: CarouselItem[];
  direction: "left" | "right";
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`carousel-row ${
        direction === "left" ? "carousel-row-left" : "carousel-row-right"
      }`}
    >
      {doubled.map((item, i) => (
        <FormatCard key={`${item.ext}-${i}`} item={item} />
      ))}
    </div>
  );
}

export function FormatCarousel() {
  return (
    <div className="carousel-wrap carousel-mask flex flex-col gap-4 overflow-hidden py-2">
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-medium text-muted-foreground">
          → У Markdown
        </span>
        <Row items={ROW1} direction="left" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-xs font-medium text-muted-foreground">
          З Markdown →
        </span>
        <Row items={ROW2} direction="right" />
      </div>
    </div>
  );
}
