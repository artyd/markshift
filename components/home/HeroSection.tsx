"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import {
  TO_MARKDOWN_FORMATS,
  FROM_MARKDOWN_FORMATS,
} from "@/lib/constants/formats";

const SOURCE_BADGES = ["📄 DOCX", "📕 PDF", "📊 XLSX", "🌐 HTML", "📚 EPUB"];
const TARGET_BADGES = ["🌐 HTML", "📕 PDF", "📄 DOCX", "🔧 JSON", "📚 EPUB"];

const TOTAL_FORMATS =
  TO_MARKDOWN_FORMATS.filter((f) => f.implemented).length +
  FROM_MARKDOWN_FORMATS.filter((f) => f.implemented).length;

const STATS = [
  { value: `${TOTAL_FORMATS}+`, label: "форматів" },
  { value: "50 МБ", label: "ліміт файлу" },
  { value: "Без", label: "реєстрації" },
  { value: "0", label: "файлів збережено" },
];

function scrollToConverter() {
  document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:pt-24">
      {/* Animated mesh background. */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="animate-mesh absolute left-1/4 top-0 size-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="animate-mesh absolute right-1/4 top-20 size-72 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex justify-center"
      >
        <Badge
          variant="outline"
          className="gap-2 rounded-full border-primary/40 bg-primary/5 px-4 py-1.5 text-sm"
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
        className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
      >
        Конвертуйте <span className="text-gradient">будь-що</span> у Markdown
        <br className="hidden sm:block" /> і навпаки
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
      >
        Завантажте файл — отримайте чистий <code>.md</code>. Або перетворіть
        Markdown у потрібний формат. Швидко, безкоштовно та приватно.
      </motion.p>

      {/* Animated format-flow: sources →→ .md →→ targets */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
        }}
        className="mt-9 flex flex-wrap items-center justify-center gap-2 text-sm"
      >
        {SOURCE_BADGES.map((b) => (
          <FlowBadge key={`s-${b}`}>{b}</FlowBadge>
        ))}

        <motion.div
          variants={flowItem}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-1 flex size-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary"
        >
          <Logo size={30} hideLabel />
        </motion.div>

        {TARGET_BADGES.map((b) => (
          <FlowBadge key={`t-${b}`}>{b}</FlowBadge>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-10"
      >
        <Button
          size="lg"
          onClick={scrollToConverter}
          className="h-12 gap-2 rounded-full bg-gradient-primary px-7 text-base text-primary-foreground"
        >
          Почати конвертацію
          <ArrowDown className="size-5" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4"
      >
        {STATS.map((s) => (
          <div key={s.label}>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

const flowItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

function FlowBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      variants={flowItem}
      className="rounded-full border border-border bg-card px-3 py-1"
    >
      {children}
    </motion.span>
  );
}
