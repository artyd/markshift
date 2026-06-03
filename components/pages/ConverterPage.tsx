'use client';
import { ConverterZone } from '@/components/converter/ConverterZone';

export function ConverterPage() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: '#F8F8F8',
      overflow: 'hidden',
    }}>

      <div style={{
        padding: '28px 48px 20px',
        borderBottom: '1px solid #E0E0E0',
        background: '#FFFFFF',
        flexShrink: 0,
      }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px',
          color: '#111111', margin: 0,
        }}>
          📄 Конвертація файлів
        </h2>
        <p style={{
          fontSize: '14px', color: '#888888',
          margin: '4px 0 0',
        }}>
          Завантаж файл — отримай Markdown або будь-який інший формат
        </p>
      </div>

      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '28px 32px',
      }}>
        <ConverterZone />
      </div>
    </div>
  );
}
