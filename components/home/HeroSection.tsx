'use client';

import { motion } from 'framer-motion';
import { FormatFlipCard } from '@/components/home/FormatFlipCard';

const CHECKLIST = [
  '25+ форматів: PDF, DOCX, XLSX, PPTX та інші',
  'Файли не зберігаються на сервері',
  'Безкоштовно, без реєстрації',
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function HeroSection() {
  return (
    <div style={{
      position: 'relative', zIndex: 1,
      maxWidth: '1200px', margin: '0 auto',
      padding: '0 48px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '64px',
      alignItems: 'center',
      width: '100%',
    }}
      className="hero-grid"
    >
      {/* Left: text, checklist, CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          border: '1px solid hsl(var(--border))', borderRadius: '99px',
          padding: '6px 16px', fontSize: '13px', color: 'hsl(var(--muted-foreground))',
          background: 'hsl(var(--card))', marginBottom: '24px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#0D9488', display: 'inline-block',
          }} />
          Конвертер файлів · 25+ форматів
        </div>

        <h1 style={{
          fontSize: '48px', fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-1.5px', marginBottom: '20px',
          color: 'hsl(var(--foreground))',
        }}>
          Конвертуй будь-який файл у{' '}
          <span className="gradient-text">Markdown</span> — і назад
        </h1>

        <p style={{
          fontSize: '16px', color: 'hsl(var(--muted-foreground))', maxWidth: '460px',
          lineHeight: 1.7, marginBottom: '24px',
        }}>
          PDF, DOCX, Excel, PowerPoint та 20+ форматів.
          Безкоштовно, без реєстрації, файли не зберігаються.
        </p>

        {/* Checklist */}
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 0 36px', padding: 0, listStyle: 'none' }}>
          {CHECKLIST.map((item) => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'hsl(var(--foreground))' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#D1FAE5', border: '1px solid #6EE7B7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => scrollTo('converter')}
            style={{
              height: '52px', padding: '0 28px', fontSize: '15px', fontWeight: 600,
              background: 'hsl(var(--foreground))', color: 'hsl(var(--background))',
              border: 'none', borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Почати конвертацію
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => scrollTo('converter')}
            style={{
              height: '52px', padding: '0 28px', fontSize: '15px', fontWeight: 600,
              background: 'hsl(var(--card))', color: 'hsl(var(--foreground))',
              border: '1.5px solid hsl(var(--border))', borderRadius: '14px', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--secondary))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--card))')}
          >
            Переглянути формати
          </button>
        </div>
      </motion.div>

      {/* Right: FormatFlipCard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <FormatFlipCard />
      </motion.div>
    </div>
  );
}
