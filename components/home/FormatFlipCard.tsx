'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FORMATS = [
  { icon: '📕', name: 'PDF',       ext: '.pdf',  desc: 'Portable Document Format',  color: '#FFF1F0', accent: '#FF6B6B' },
  { icon: '📄', name: 'Word',      ext: '.docx', desc: 'Microsoft Word Document',    color: '#F0F4FF', accent: '#4F7FFF' },
  { icon: '📊', name: 'Excel',     ext: '.xlsx', desc: 'Таблиці та дані',            color: '#F0FFF4', accent: '#22C55E' },
  { icon: '📽️', name: 'PowerPoint',ext: '.pptx', desc: 'Презентації',                color: '#FFF7F0', accent: '#FF8C42' },
  { icon: '🌐', name: 'HTML',      ext: '.html', desc: 'Веб-сторінки',               color: '#F5F0FF', accent: '#A855F7' },
  { icon: '📊', name: 'CSV',       ext: '.csv',  desc: 'Таблиці з даними',           color: '#F0FAFF', accent: '#06B6D4' },
  { icon: '🔧', name: 'JSON',      ext: '.json', desc: 'Структуровані дані',         color: '#FFFBF0', accent: '#F59E0B' },
  { icon: '⚙️', name: 'YAML',      ext: '.yaml', desc: 'Конфігураційні файли',       color: '#FFF0FB', accent: '#EC4899' },
  { icon: '📐', name: 'LaTeX',     ext: '.tex',  desc: 'Наукові документи',          color: '#F0FFF9', accent: '#10B981' },
  { icon: '📚', name: 'EPUB',      ext: '.epub', desc: 'Електронні книги',           color: '#FFF5F0', accent: '#EF4444' },
  { icon: '📝', name: 'AsciiDoc',  ext: '.adoc', desc: 'Технічна документація',      color: '#F5F5FF', accent: '#6366F1' },
  { icon: '🌿', name: 'XML',       ext: '.xml',  desc: 'Розширювана розмітка',       color: '#F0FFF7', accent: '#059669' },
];

const variants = {
  enter:  { y: 80,  opacity: 0, scale: 0.92, rotateX: -8 },
  center: { y: 0,   opacity: 1, scale: 1,    rotateX: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  exit:   { y: -80, opacity: 0, scale: 0.92, rotateX: 8,
    transition: { duration: 0.4, ease: [0.55, 0, 0.45, 1] as const } },
};

export function FormatFlipCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % FORMATS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const fmt = FORMATS[index];

  return (
    <div style={{
      perspective: '1000px', width: '100%', maxWidth: '440px',
      margin: '0 auto', height: '340px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          variants={variants}
          initial="enter" animate="center" exit="exit"
          style={{
            position: 'absolute', width: '100%', height: '300px',
            background: fmt.color,
            borderRadius: '28px',
            border: `1px solid ${fmt.accent}22`,
            boxShadow: `0 24px 64px ${fmt.accent}20, 0 4px 16px rgba(0,0,0,0.06)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px', userSelect: 'none',
          }}
        >
          {/* Icon in accented square */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '22px',
            background: `${fmt.accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '44px', lineHeight: 1 }}>{fmt.icon}</span>
          </div>

          {/* Format name */}
          <div style={{ fontSize: '34px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-1px', marginBottom: '8px' }}>
            {fmt.name}
          </div>

          {/* Extension badge */}
          <div style={{
            fontSize: '13px', fontFamily: 'monospace', fontWeight: 700,
            color: fmt.accent, background: `${fmt.accent}18`,
            padding: '5px 16px', borderRadius: '99px', marginBottom: '14px',
          }}>
            {fmt.ext}
          </div>

          {/* Description */}
          <div style={{ fontSize: '14px', color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
            {fmt.desc}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar (no dots) */}
      <div style={{
        position: 'absolute', bottom: '-4px',
        width: '80px', height: '3px',
        background: '#E8E8E8', borderRadius: '99px', overflow: 'hidden',
      }}>
        <motion.div
          key={`progress-${index}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.8, ease: 'linear' }}
          style={{ height: '100%', background: fmt.accent, borderRadius: '99px' }}
        />
      </div>
    </div>
  );
}
