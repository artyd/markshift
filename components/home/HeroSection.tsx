"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormatSlider } from "@/components/home/FormatSlider";
import {
  TO_MARKDOWN_FORMATS,
  FROM_MARKDOWN_FORMATS,
} from "@/lib/constants/formats";

const TOTAL_FORMATS =
  TO_MARKDOWN_FORMATS.filter((f) => f.implemented).length +
  FROM_MARKDOWN_FORMATS.filter((f) => f.implemented).length;

const CHECKLIST = ["Повністю приватно", "Швидко та в пам'яті", "Без реєстрації"];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-12 sm:pt-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center lg:text-left"
        >
          <Badge
            variant="outline"
            className="mb-6 gap-2 rounded-full border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-foreground"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            ✨ {TOTAL_FORMATS}+ форматів підтримується
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Конвертуй будь-який файл у{" "}
            <span className="gradient-text">Markdown</span> — і назад
          </h1>

          <p className="mx-auto mt-5 max-w-[480px] text-lg text-muted-foreground lg:mx-0">
            Завантаж файл — отримай чистий <code>.md</code>. Або перетвори
            Markdown у потрібний формат. Швидко, безкоштовно та приватно.
          </p>

          <ul className="mx-auto mt-6 flex max-w-[480px] flex-col gap-2 text-sm text-muted-foreground lg:mx-0">
            {CHECKLIST.map((c) => (
              <li key={c} className="flex items-center justify-center gap-2 lg:justify-start">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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
              onClick={() => scrollTo("converter")}
              className="h-12 rounded-xl px-7 text-base"
            >
              Читати Markdown
            </Button>
          </div>
        </motion.div>

        {/* Right: rotating format card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <FormatSlider />
        </motion.div>
      </div>
    </section>
  );
}
