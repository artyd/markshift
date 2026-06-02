"use client";

import { motion } from "framer-motion";
import { Upload, Wand2, Download, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: Upload, title: "Завантажте", text: "Перетягніть файл у зону завантаження або оберіть кілька одразу." },
  { icon: Wand2, title: "Конвертуйте", text: "Оберіть цільовий формат і натисніть кнопку конвертації." },
  { icon: Download, title: "Завантажте результат", text: "Скачайте готовий файл, перегляньте або скопіюйте Markdown." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <h2 className="text-center text-3xl font-bold">Як це працює</h2>
      <p className="mt-2 text-center text-muted-foreground">Три прості кроки — і ваш файл готовий.</p>

      <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative flex">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative flex w-full flex-col items-center rounded-xl border border-border bg-card p-6 text-center"
            >
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-clip-text text-5xl font-black text-transparent [background-image:var(--gradient-primary)] opacity-30">
                {i + 1}
              </span>
              <div className="mt-3 mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
                <s.icon className="size-7" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </motion.div>

            {/* Connecting arrow (desktop only) */}
            {i < STEPS.length - 1 && (
              <div className="absolute top-1/2 -right-5 z-10 hidden -translate-y-1/2 text-primary sm:block">
                <ArrowRight className="size-6" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
