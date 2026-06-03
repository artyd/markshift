'use client';
import { AnimatedBackground } from '@/components/home/AnimatedBackground';
import { FormatFlipCard } from '@/components/home/FormatFlipCard';

interface HomePageProps {
  onNavigate: (page: 'converter' | 'editor' | 'reader') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
      background: 'hsl(var(--background))',
    }}>

      <AnimatedBackground />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        padding: '0 80px',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Left: text */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: '1px solid hsl(var(--border))', borderRadius: '99px',
            padding: '5px 14px', fontSize: '13px',
            color: 'hsl(var(--muted-foreground))',
            background: 'hsl(var(--card))',
            width: 'fit-content', marginBottom: '24px',
          }}>
            ✨ Конвертер файлів · 25+ форматів
          </div>

          <h1 style={{
            fontSize: '52px', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-2px',
            color: 'hsl(var(--foreground))',
            margin: '0 0 20px',
          }}>
            Конвертуй будь-який файл у Markdown — і назад
          </h1>

          <p style={{
            fontSize: '17px', color: 'hsl(var(--muted-foreground))',
            lineHeight: 1.7, maxWidth: '460px', margin: '0 0 32px',
          }}>
            PDF, DOCX, Excel, PowerPoint та 20+ форматів.
            Безкоштовно, без реєстрації, файли не зберігаються.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
            {[
              '25+ форматів: PDF, DOCX, XLSX, PPTX та інші',
              'Файли не зберігаються на сервері',
              'Безкоштовно, без реєстрації',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'hsl(142 71% 45% / 0.15)',
                  border: '1px solid hsl(142 71% 45% / 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: 'hsl(142 71% 45%)', flexShrink: 0,
                }}>✓</div>
                <span style={{ fontSize: '15px', color: 'hsl(var(--foreground))' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Three nav buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              { page: 'converter', icon: '📄', label: 'Конвертація' },
              { page: 'editor',    icon: '✏️', label: 'Редагування' },
              { page: 'reader',    icon: '👁',  label: 'Перегляд'   },
            ].map(btn => (
              <button
                key={btn.page}
                onClick={() => onNavigate(btn.page as any)}
                style={{
                  padding: '12px 24px', borderRadius: '10px',
                  border: '1.5px solid hsl(var(--border))',
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'hsl(var(--foreground))';
                  e.currentTarget.style.color = 'hsl(var(--background))';
                  e.currentTarget.style.borderColor = 'hsl(var(--foreground))';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'hsl(var(--background))';
                  e.currentTarget.style.color = 'hsl(var(--foreground))';
                  e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: flip card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FormatFlipCard />
        </div>
      </div>
    </div>
  );
}
