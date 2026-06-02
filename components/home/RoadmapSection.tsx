'use client';

import { motion } from 'framer-motion';

const PIPELINE = [
  {
    num: '01',
    title: 'Завантаж файл',
    desc: 'PDF, DOCX, XLSX, PPTX, HTML — будь-який із 25+ підтримуваних форматів.',
    color: 'hsl(221 83% 53%)',
    bg: 'hsl(221 83% 53% / 0.08)',
  },
  {
    num: '02',
    title: 'Парсинг і структурування',
    desc: 'Вилучаємо текст, таблиці, заголовки та форматування з вихідного файлу.',
    color: 'hsl(262 83% 58%)',
    bg: 'hsl(262 83% 58% / 0.08)',
  },
  {
    num: '03',
    title: 'Конвертація у Markdown',
    desc: 'Перетворюємо структуру в чистий GFM-Markdown із мінімальним "шумом".',
    color: 'hsl(160 70% 42%)',
    bg: 'hsl(160 70% 42% / 0.08)',
  },
  {
    num: '04',
    title: 'Завантаж результат',
    desc: 'Отримай готовий .md — компактний і оптимізований для LLM-контексту.',
    color: 'hsl(40 90% 50%)',
    bg: 'hsl(40 90% 50% / 0.08)',
  },
];

const TOKEN_DATA = [
  { label: 'PDF', tokens: 8000, pct: 100, color: '#EF4444' },
  { label: 'DOCX', tokens: 6000, pct: 75, color: '#F97316' },
  { label: 'Markdown', tokens: 800, pct: 10, color: '#22C55E' },
];

export function RoadmapSection() {
  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: '64px' }}
      >
        <h2 style={{
          fontSize: '34px', fontWeight: 700, letterSpacing: '-0.8px',
          color: 'hsl(var(--foreground))', marginBottom: '12px',
        }}>
          Як це працює під капотом
        </h2>
        <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', maxWidth: '520px', margin: '0 auto' }}>
          Чотири кроки від вихідного файлу до чистого Markdown
        </p>
      </motion.div>

      {/* Pipeline cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        marginBottom: '64px',
      }}>
        {PIPELINE.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            style={{
              background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
              borderRadius: '20px', padding: '28px 24px',
              display: 'flex', flexDirection: 'column', gap: '16px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Decorative number */}
            <div style={{
              position: 'absolute', top: '-8px', right: '16px',
              fontSize: '72px', fontWeight: 800, lineHeight: 1,
              color: step.color, opacity: 0.08, userSelect: 'none',
              letterSpacing: '-3px',
            }}>
              {step.num}
            </div>

            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: step.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: step.color }}>
                {step.num}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '8px' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Token comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45 }}
        style={{
          background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
          borderRadius: '24px', padding: '40px 48px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '32px' }}>
          Порівняння токенів LLM-контексту
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {TOKEN_DATA.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div style={{
                width: '64px', fontSize: '13px', fontWeight: 600,
                color: 'hsl(var(--foreground))', flexShrink: 0,
              }}>
                {item.label}
              </div>
              <div style={{ flex: 1, height: '10px', borderRadius: '99px', background: 'hsl(var(--muted))' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: '99px', background: item.color,
                    minWidth: '8px',
                  }}
                />
              </div>
              <div style={{
                width: '72px', textAlign: 'right', fontSize: '13px',
                color: 'hsl(var(--muted-foreground))', flexShrink: 0,
              }}>
                ~{item.tokens.toLocaleString()} tkn
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '24px', fontSize: '12px', color: 'hsl(var(--muted-foreground))', opacity: 0.7 }}>
          * Приблизні значення для документа з 5 сторінок (A4). Markdown економить до 90% токенів.
        </div>
      </motion.div>
    </section>
  );
}
