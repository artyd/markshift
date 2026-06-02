'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { AnimatedBackground } from '@/components/home/AnimatedBackground';
import { ScrollIndicator } from '@/components/home/ScrollIndicator';
import { ConverterZone } from '@/components/converter/ConverterZone';
import { ConverterBoundary } from '@/components/converter/ConverterBoundary';
import { MarkdownReader } from '@/components/reader/MarkdownReader';
import { MarkdownEditor } from '@/components/reader/MarkdownEditor';
import { RoadmapSection } from '@/components/home/RoadmapSection';

type TabId = 'converter' | 'reader' | 'editor';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'converter', icon: '📄', label: 'Конвертувати' },
  { id: 'reader',    icon: '👁',  label: 'Переглянути' },
  { id: 'editor',    icon: '✏️',  label: 'Редагувати'  },
];

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('converter');

  return (
    <>
      <Header />
      <main className="snap-container">

      {/* ═══ SECTION 1 — Hero (100vh) ═══ */}
      <section className="snap-section" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'hsl(var(--background))',
      }}>
        <AnimatedBackground />
        <HeroSection />
        <ScrollIndicator targetId="converter" />
      </section>

      {/* ═══ SECTION 2 — Converter / Reader / Editor (100vh) ═══ */}
      <section id="converter" className="snap-section scrollable-inside" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'hsl(var(--muted))',
        padding: '80px 48px',
      }}>
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '8px', color: '#0F172A' }}>
            Твій інструмент для роботи з файлами
          </h2>
          <p style={{ fontSize: '16px', color: '#888' }}>
            Конвертуй, переглядай або редагуй — все в одному місці
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', gap: '4px',
            background: '#EBEBEB', padding: '5px', borderRadius: '16px',
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 28px', borderRadius: '12px', border: 'none',
                  cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: tab === t.id ? 'white' : 'transparent',
                  color: tab === t.id ? '#1a1a1a' : '#999',
                  boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.09)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'converter' && (
          <ConverterBoundary>
            <ConverterZone />
          </ConverterBoundary>
        )}
        {tab === 'reader' && <MarkdownReader />}
        {tab === 'editor' && <MarkdownEditor />}
      </section>

      {/* ═══ SECTION 3 — How it works + Footer (100vh) ═══ */}
      <section className="snap-section scrollable-inside" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'hsl(var(--background))',
        padding: '80px 48px 0',
      }}>
        <HowItWorks />
        <RoadmapSection />
        <Footer />
      </section>
      </main>
    </>
  );
}
