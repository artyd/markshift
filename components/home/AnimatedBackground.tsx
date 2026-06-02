'use client';

const ITEMS = [
  { icon: '📄', size: 48, x: 5,  y: 15, dur: 18, delay: 0,  rot: true  },
  { icon: '📊', size: 36, x: 80, y: 10, dur: 22, delay: 3,  rot: false },
  { icon: '📕', size: 56, x: 15, y: 70, dur: 25, delay: 5,  rot: true  },
  { icon: '🌐', size: 40, x: 70, y: 60, dur: 20, delay: 2,  rot: false },
  { icon: '📝', size: 32, x: 50, y: 20, dur: 28, delay: 7,  rot: true  },
  { icon: '📐', size: 44, x: 90, y: 40, dur: 16, delay: 1,  rot: false },
  { icon: '⚙️', size: 28, x: 30, y: 85, dur: 23, delay: 4,  rot: true  },
  { icon: '📚', size: 52, x: 60, y: 75, dur: 19, delay: 8,  rot: false },
  { icon: '🔧', size: 30, x: 20, y: 45, dur: 26, delay: 6,  rot: true  },
  { icon: '📋', size: 42, x: 45, y: 55, dur: 21, delay: 9,  rot: false },
];

export function AnimatedBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
    }}>
      {/* Radial gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)',
      }} />

      {/* Subtle grid pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }}>
        <defs>
          <pattern id="bg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#000" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grid)" />
      </svg>

      {/* Floating icons */}
      {ITEMS.map((item, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${item.x}%`, top: `${item.y}%`,
          fontSize: `${item.size}px`,
          opacity: 0.07,
          filter: 'grayscale(100%)',
          animation: [
            `float-${i % 3} ${item.dur}s ease-in-out ${item.delay}s infinite`,
            item.rot ? `bg-spin ${item.dur * 3}s linear ${item.delay}s infinite` : '',
          ].filter(Boolean).join(', '),
        }}>
          {item.icon}
        </div>
      ))}
    </div>
  );
}
