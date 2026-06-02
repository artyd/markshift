'use client';

export function ScrollIndicator({ targetId }: { targetId: string }) {
  return (
    <div
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })}
      style={{
        position: 'absolute', bottom: '32px', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        cursor: 'pointer', opacity: 0.45,
        animation: 'bounce-scroll 2s ease-in-out infinite',
      }}
    >
      <span style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#888' }}>
        Scroll
      </span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12l7 7 7-7" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
