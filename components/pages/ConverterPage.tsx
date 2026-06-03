'use client';
import { ConverterZone } from '@/components/converter/ConverterZone';

export function ConverterPage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'hsl(var(--muted) / 0.3)',
      overflow: 'hidden',
    }}>

      <div style={{
        padding: '32px 80px 24px',
        borderBottom: '1px solid hsl(var(--border))',
        background: 'hsl(var(--background))',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px',
          color: 'hsl(var(--foreground))', margin: 0,
        }}>
          📄 Конвертація файлів
        </h2>
        <p style={{
          fontSize: '14px', color: 'hsl(var(--muted-foreground))',
          margin: '4px 0 0',
        }}>
          Завантаж файл — отримай Markdown або будь-який інший формат
        </p>
      </div>

      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 48px',
      }}>
        <ConverterZone />
      </div>
    </div>
  );
}
