import { GithubIcon } from "@/components/GithubIcon";
import { SITE } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #E2E8F0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="hsl(var(--primary))"/>
            <path d="M8 26V10l10 10 10-10v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M22 20h6M25 17l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>MarkShift</span>
        </div>

        <span style={{ fontSize: '13px', color: '#888' }}>
          © {new Date().getFullYear()} MarkShift · Файли не зберігаються
        </span>

        <a
          href={SITE.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', textDecoration: 'none', transition: 'color 0.2s' }}
        >
          <GithubIcon className="size-4" />
          GitHub ↗
        </a>
      </div>
    </footer>
  );
}
