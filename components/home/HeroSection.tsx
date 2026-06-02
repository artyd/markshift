"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormatCarousel } from "@/components/home/FormatCarousel";
import {
  TO_MARKDOWN_FORMATS,
  FROM_MARKDOWN_FORMATS,
} from "@/lib/constants/formats";

const TOTAL_FORMATS =
  TO_MARKDOWN_FORMATS.filter((f) => f.implemented).length +
  FROM_MARKDOWN_FORMATS.filter((f) => f.implemented).length;

const STATS = [
  { value: `${TOTAL_FORMATS}+`, label: "форматів" },
  { value: "50 МБ", label: "ліміт файлу" },
  { value: "0", label: "збережених файлів" },
  { value: "Безкоштовно", label: "без реєстрації" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex justify-center"
      >
        <Badge
          variant="outline"
          className="gap-2 rounded-full border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-foreground"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          ✨ {TOTAL_FORMATS}+ форматів підтримується
        </Badge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-4xl font-extrabold tracking-[-0.02em] sm:text-6xl"
      >
        Конвертуй будь-який файл
        <br />
        у <span className="gradient-text">Markdown</span> — і назад
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mt-5 max-w-[480px] text-lg text-muted-foreground"
      >
        Завантаж файл — отримай чистий <code>.md</code>. Або перетвори Markdown
        у потрібний формат. Швидко, безкоштовно та приватно.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Button
          size="lg"
          onClick={() => scrollTo("converter")}
          className="h-12 gap-2 rounded-xl px-7 text-base"
        >
          Почати конвертацію
          <ArrowRight className="size-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => scrollTo("formats")}
          className="h-12 rounded-xl px-7 text-base"
        >
          Переглянути формати
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mx-auto mt-16 max-w-5xl"
      >
        <FormatCarousel />
      </motion.div>

      <Separator className="mx-auto mt-12 max-w-2xl" />

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-[28px] font-bold text-foreground">
              {s.value}
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
