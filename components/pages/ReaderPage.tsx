'use client';
import { MarkdownReader } from '@/components/reader/MarkdownReader';

export function ReaderPage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'hsl(var(--background))',
      overflow: 'hidden',
    }}>

      <div style={{
        padding: '24px 80px 20px',
        borderBottom: '1px solid hsl(var(--border))',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px',
          color: 'hsl(var(--foreground))', margin: 0,
        }}>
          👁 Перегляд Markdown
        </h2>
        <p style={{
          fontSize: '14px', color: 'hsl(var(--muted-foreground))',
          margin: '4px 0 0',
        }}>
          Відкрий .md файл або вставте текст — читай у зручному вигляді
        </p>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '24px 80px' }}>
        <MarkdownReader />
      </div>
    </div>
  );
}
