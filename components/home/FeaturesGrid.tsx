"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, FileStack, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Zap,
    title: "Швидко",
    text: "Конвертація відбувається в пам'яті за лічені секунди.",
  },
  {
    icon: ShieldCheck,
    title: "Приватно",
    text: "Файли не зберігаються на сервері й не покидають вашу сесію.",
  },
  {
    icon: FileStack,
    title: "Багато форматів",
    text: "DOCX, PDF, HTML, CSV, JSON, EPUB — і список зростає.",
  },
  {
    icon: Eye,
    title: "Живий перегляд",
    text: "Бачте результат одразу: рендер і вихідний код поруч.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="group h-full border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:border-primary/40 hover:shadow-lg">
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="size-6" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
