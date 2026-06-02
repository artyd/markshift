"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SlideItem = {
  icon: string;
  name: string;
  ext: string;
  /** Pastel tint applied in light mode; neutralised in dark via `.fmt-card`. */
  color: string;
};

const FORMATS: SlideItem[] = [
  { icon: "📄", name: "Word", ext: "docx", color: "hsl(213 94% 95%)" },
  { icon: "📕", name: "PDF", ext: "pdf", color: "hsl(0 86% 96%)" },
  { icon: "🌐", name: "HTML", ext: "html", color: "hsl(25 95% 95%)" },
  { icon: "📊", name: "Excel", ext: "xlsx", color: "hsl(142 71% 94%)" },
  { icon: "📑", name: "CSV", ext: "csv", color: "hsl(160 84% 94%)" },
  { icon: "📽️", name: "PowerPoint", ext: "pptx", color: "hsl(14 91% 95%)" },
  { icon: "🧾", name: "JSON", ext: "json", color: "hsl(48 96% 93%)" },
  { icon: "⚙️", name: "YAML", ext: "yaml", color: "hsl(204 94% 94%)" },
  { icon: "📚", name: "EPUB", ext: "epub", color: "hsl(258 90% 95%)" },
  { icon: "📝", name: "RTF", ext: "rtf", color: "hsl(280 80% 96%)" },
  { icon: "🗂️", name: "ODT", ext: "odt", color: "hsl(188 86% 94%)" },
  { icon: "🔖", name: "XML", ext: "xml", color: "hsl(330 81% 96%)" },
];

const INTERVAL_MS = 2500;

export function FormatSlider() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  const go = useCallback((next: number) => {
    setIndex(((next % FORMATS.length) + FORMATS.length) % FORMATS.length);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
    }
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % FORMATS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const item = FORMATS[index];

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative flex h-[260px] w-full max-w-[340px] items-center justify-center"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={item.ext}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fmt-card flex size-full flex-col items-center justify-center gap-4 rounded-3xl border border-border shadow-lg"
            style={{ ["--tint" as string]: item.color }}
          >
            <span className="text-[64px] leading-none">{item.icon}</span>
            <span className="text-xl font-bold text-foreground">{item.name}</span>
            <span className="rounded-full bg-foreground/5 px-3 py-1 font-mono text-sm text-muted-foreground">
              .{item.ext}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {FORMATS.map((f, i) => (
          <button
            key={f.ext}
            type="button"
            onClick={() => go(i)}
            aria-label={`Показати ${f.name}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
