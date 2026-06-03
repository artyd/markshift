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
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E0E0E0',
              boxShadow: '0 40px 100px rgba(0,0,0,0.35)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px', height: '56px',
              borderBottom: '1px solid #E0E0E0',
              background: '#F5F5F5', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', flex: 1 }}>
                {files.map((file, i) => (
                  <button key={i} onClick={() => setActiveTab(i)} style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontSize: '13px',
                    fontWeight: activeTab === i ? 700 : 400,
                    background: activeTab === i ? '#111111' : 'transparent',
                    color: activeTab === i ? '#FFFFFF' : '#888888',
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
                  border: '1px solid #E0E0E0', background: '#F0F0F0',
                  color: '#888888', fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginLeft: '16px', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#111111'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F0F0F0'; e.currentTarget.style.color = '#888888'; e.currentTarget.style.borderColor = '#E0E0E0'; }}
              >✕</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px 56px', background: '#FFFFFF' }}>
              {currentFile?.isText ? (
                currentFile.filename.endsWith('.md') ? (
                  <div
                    className="md-preview"
                    style={{ fontSize: '15px', lineHeight: 1.8, color: '#111111' }}
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <pre style={{
                    fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.7,
                    color: '#111111', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
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
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#111111' }}>
                    {currentFile?.filename}
                  </div>
                  <div style={{ fontSize: '14px', color: '#888888' }}>
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
