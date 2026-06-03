'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';

interface ResultFile {
  filename: string;
  content: string;
  mimeType: string;
  isText: boolean;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ResultFile[];
}

export function PreviewModal({ isOpen, onClose, files }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => { if (isOpen) setActiveTab(0); }, [isOpen]);

  const currentFile = files[activeTab];

  const renderedHtml = useMemo(() => {
    if (!currentFile?.isText || !currentFile.filename.endsWith('.md')) return '';
    return marked.parse(currentFile.content, { gfm: true, breaks: true }) as string;
  }, [currentFile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0, 0, 0, 0.75)',
            }}
          />

          {/* Centering wrapper */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 51,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              pointerEvents: 'all',
              width: '80vw', height: '82vh',
              background: 'hsl(var(--card))',
              borderRadius: '16px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', height: '56px',
              borderBottom: '1px solid hsl(var(--border))',
              background: 'hsl(var(--muted) / 0.4)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', flex: 1 }}>
                {files.map((file, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '13px',
                    fontWeight: activeTab === i ? 700 : 400,
                    background: activeTab === i ? 'hsl(var(--foreground))' : 'transparent',
                    color: activeTab === i ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
                    whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0,
                  }}>
                    {file.filename.endsWith('.md') ? '📝 ' :
                     file.filename.endsWith('.html') ? '🌐 ' :
                     file.filename.endsWith('.pdf') ? '📕 ' : '📄 '}
                    {file.filename.length > 20 ? file.filename.slice(0, 18) + '…' : file.filename}
                  </button>
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Закрити"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '1px solid hsl(var(--border))', background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))', fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginLeft: '16px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--foreground))'; e.currentTarget.style.color = 'hsl(var(--background))'; e.currentTarget.style.borderColor = 'hsl(var(--foreground))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
              >✕</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px', background: 'hsl(var(--card))' }}>
              {currentFile?.isText ? (
                currentFile.filename.endsWith('.md') ? (
                  <div
                    className="md-preview"
                    style={{ fontSize: '15px', lineHeight: 1.8, color: 'hsl(var(--foreground))' }}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <pre style={{
                    fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.7,
                    color: 'hsl(var(--foreground))', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                  }}>
                    {currentFile.content}
                  </pre>
                )
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  height: '100%', gap: '16px',
                }}>
                  <span style={{ fontSize: '64px' }}>📄</span>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                    {currentFile?.filename}
                  </div>
                  <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
                    Цей формат не підтримує preview — завантаж файл щоб відкрити
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
