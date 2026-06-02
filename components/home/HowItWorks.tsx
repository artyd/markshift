"use client";

import { motion } from "framer-motion";
import { Upload, Settings2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Завантаж файл",
    text: "Перетягни файл у зону завантаження або обери кілька одразу.",
  },
  {
    num: "02",
    icon: Settings2,
    title: "Обери формат",
    text: "Вкажи цільовий формат і натисни кнопку конвертації.",
  },
  {
    num: "03",
    icon: Download,
    title: "Завантаж результат",
    text: "Скачай готовий файл, переглянь або скопіюй Markdown.",
  },
];

function scrollToConverter() {
  document.getElementById("converter")?.scrollIntoView({ behavior: "smooth" });
}

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight">
        Три простих кроки
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.num} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="flex flex-col items-start gap-3"
            >
              <span className="gradient-text text-5xl font-extrabold leading-none opacity-40">
                {s.num}
              </span>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-8" />
              </div>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </motion.div>

            {i < STEPS.length - 1 && (
              <div className="absolute top-6 -right-4 hidden text-muted-foreground/40 sm:block">
                <ArrowRight className="size-6" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Button
          size="lg"
          onClick={scrollToConverter}
          className="h-12 gap-2 rounded-xl px-7 text-base"
        >
          Спробувати зараз
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </section>
  );
}
