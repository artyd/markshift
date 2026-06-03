'use client';

type Page = 'home' | 'converter' | 'editor' | 'reader';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'converter', label: 'Конвертація', icon: '📄' },
  { id: 'editor',    label: 'Редагування', icon: '✏️' },
  { id: 'reader',    label: 'Перегляд',    icon: '👁' },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {

  return (
    <header style={{
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 48px',
      borderBottom: '1px solid hsl(var(--border))',
      background: 'hsl(var(--background))',
      flexShrink: 0,
      zIndex: 100,
      position: 'relative',
    }}>

      {/* Logo — click returns to home */}
      <div
        onClick={() => onNavigate('home')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="hsl(var(--primary))"/>
          <path d="M8 26V10l10 10 10-10v16" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M22 20h6M25 17l3 3-3 3" stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.4px',
            lineHeight: 1, color: 'hsl(var(--foreground))' }}>
            MarkShift
          </div>
          <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))',
            letterSpacing: '0.5px', lineHeight: 1, marginTop: '2px' }}>
            FILE CONVERTER
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 20px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontSize: '15px', fontWeight: 600,
              transition: 'all 0.2s ease',
              background: currentPage === item.id
                ? 'hsl(var(--primary))'
                : 'transparent',
              color: currentPage === item.id
                ? 'hsl(var(--primary-foreground))'
                : 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={e => {
              if (currentPage !== item.id) {
                e.currentTarget.style.background = 'hsl(var(--muted))';
                e.currentTarget.style.color = 'hsl(var(--foreground))';
              }
            }}
            onMouseLeave={e => {
              if (currentPage !== item.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              }
            }}
          >
            <span>{item.icon}</span>
            {/* Hide label on mobile, show on md+ */}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

    </header>
  );
}
