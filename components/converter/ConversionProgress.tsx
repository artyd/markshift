"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ConversionProgressProps {
  /** 0–100. */
  value: number;
}

export function ConversionProgress({ value }: ConversionProgressProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
        className="text-primary"
      >
        <Loader2 className="size-10" />
      </motion.div>
      <p className="font-medium">Конвертуємо файл…</p>
      <div className="relative h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="animate-shimmer relative h-full rounded-full bg-gradient-primary"
          initial={{ width: "5%" }}
          animate={{ width: `${value}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>
      <p className="text-sm text-muted-foreground">{Math.round(value)}%</p>
    </div>
  );
}
