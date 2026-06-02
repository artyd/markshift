'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { marked } from 'marked';
import { toast } from 'sonner';
import { LIMITS } from '@/lib/constants/limits';

type ViewMode = 'split' | 'raw' | 'preview';

export function MarkdownReader() {
  const [markdown, setMarkdown] = useState('');
  const [fileName, setFileName] = useState('');
  const [view, setView] = useState<ViewMode>('split');

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => setMarkdown((e.target?.result as string) ?? '');
    reader.onerror = () => toast.error('Не вдалося прочитати файл.');
    reader.readAsText(file, 'UTF-8');
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: LIMITS.MAX_FILE_SIZE,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.md', '.txt'],
    },
  });

  const rendered = useMemo(
    () => (markdown ? (marked.parse(markdown, { gfm: true, breaks: true }) as string) : ''),
    [markdown],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('Скопійовано в буфер обміну');
    } catch {
      toast.error('Не вдалося скопіювати');
    }
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Empty state: dropzone + paste textarea
  if (!markdown) {
    return (
      <div>
        <div
          {...getRootProps()}
          style={{
            minHeight: '320px', width: '80%', margin: '0 auto',
            border: `2px dashed ${isDragActive ? '#3B82F6' : '#E2E8F0'}`,
            borderRadius: '24px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: isDragActive ? '#EFF6FF' : 'white', padding: '48px',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: '64px', marginBottom: '16px', lineHeight: 1 }}>📖</div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#0F172A' }}>
            {isDragActive ? 'Відпустіть файл тут' : 'Перетягни .md файл або клікни'}
          </div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
            Підтримуються .md та .markdown файли
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); open(); }}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: '1px solid #E2E8F0',
              background: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: 500,
              transition: 'background 0.2s',
            }}
          >
            Обрати файл
          </button>
        </div>

        <div style={{ textAlign: 'center', margin: '24px 0', color: '#bbb', fontSize: '14px' }}>
          — або —
        </div>

        <textarea
          placeholder="Вставте Markdown текст сюди..."
          onChange={e => {
            const v = e.target.value;
            if (v.trim()) {
              setMarkdown(v);
              setFileName('paste.md');
            }
          }}
          style={{
            width: '80%', margin: '0 auto', display: 'block',
            minHeight: '160px', padding: '16px', borderRadius: '12px',
            border: '1px solid #E2E8F0', fontSize: '14px',
            fontFamily: 'monospace', resize: 'vertical',
            outline: 'none',
          }}
        />
      </div>
    );
  }

  const lines = markdown.split('\n');

  return (
    <div style={{ width: '90%', margin: '0 auto' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
        background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px',
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          📄 {fileName} · {lines.length} рядків
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['split', 'raw', 'preview'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: '1px solid #E2E8F0',
                background: view === v ? '#1a1a1a' : 'white',
                color: view === v ? 'white' : '#555',
                fontWeight: 500, transition: 'all 0.15s',
              }}
            >
              {v === 'split' ? '⬛ Split' : v === 'raw' ? '📝 Raw' : '👁 Preview'}
            </button>
          ))}
          <button
            onClick={copy}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', cursor: 'pointer' }}
          >
            📋 Копіювати
          </button>
          <button
            onClick={download}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', cursor: 'pointer' }}
          >
            ↓ Завантажити
          </button>
          <button
            onClick={() => { setMarkdown(''); setFileName(''); }}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #FFE0E0', background: '#FFF5F5', color: '#DC2626', fontSize: '13px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Split / Raw / Preview panes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'split' ? '1fr 1fr' : '1fr',
        gap: '16px',
        height: '580px',
      }}>
        {(view === 'split' || view === 'raw') && (
          <div style={{
            background: '#1e1e2e', borderRadius: '16px', overflow: 'auto', padding: '24px',
          }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#cdd6f4', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {lines.map((line, i) => (
                <div key={i}>
                  <span style={{ color: '#45475a', userSelect: 'none', marginRight: '16px', minWidth: '32px', display: 'inline-block', textAlign: 'right' }}>
                    {i + 1}
                  </span>
                  {line || ' '}
                </div>
              ))}
            </pre>
          </div>
        )}
        {(view === 'split' || view === 'preview') && (
          <div style={{
            background: 'white', border: '1px solid #E2E8F0',
            borderRadius: '16px', overflow: 'auto', padding: '32px',
          }}>
            <div
              className="md-preview"
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
