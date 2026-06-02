"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TO_MARKDOWN_FORMATS,
  FROM_MARKDOWN_FORMATS,
} from "@/lib/constants/formats";

const SOURCES = TO_MARKDOWN_FORMATS.filter(
  (f) => f.implemented && !["htm", "yml"].includes(f.ext),
);
const TARGETS = FROM_MARKDOWN_FORMATS.filter((f) => f.implemented);

type GridFormat = { ext: string; label: string; icon: string };

function FormatCard({ item }: { item: GridFormat }) {
  return (
    <div className="fmt-card flex flex-col items-center justify-center gap-1.5 rounded-2xl py-5 transition-all">
      <span className="text-[28px] leading-none">{item.icon}</span>
      <span className="text-[13px] font-semibold text-foreground">
        {item.label}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">
        .{item.ext}
      </span>
    </div>
  );
}

function Grid({ items }: { items: GridFormat[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
    >
      {items.map((f) => (
        <FormatCard key={f.ext} item={f} />
      ))}
    </motion.div>
  );
}

export function FormatGrid() {
  const [tab, setTab] = useState("to");

  return (
    <section
      id="formats"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16"
    >
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Всі підтримувані формати
      </h2>
      <p className="mt-2 text-center text-muted-foreground">
        Markdown — універсальний центр. Конвертуй в обидва боки.
      </p>

      <div className="mt-8 flex justify-center">
        <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
          <TabsList>
            <TabsTrigger value="to">→ У Markdown ({SOURCES.length})</TabsTrigger>
            <TabsTrigger value="from">
              З Markdown → ({TARGETS.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {tab === "to" ? (
            <Grid key="to" items={SOURCES} />
          ) : (
            <Grid key="from" items={TARGETS} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
