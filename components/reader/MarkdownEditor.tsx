'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

type ViewMode = 'edit' | 'split' | 'preview';

export function MarkdownEditor() {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isModified, setIsModified] = useState(false);
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name);
    setIsModified(false);
    const r = new FileReader();
    r.onload = e => setContent((e.target?.result as string) ?? '');
    r.readAsText(file, 'UTF-8');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.md'],
    },
    noClick: !!content,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Markdown скопійовано в буфер обміну');
    } catch {
      toast.error('Не вдалося скопіювати Markdown');
    }
  };

  const handleSave = () => {
    const a = document.createElement('a');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }));
    a.href = url;
    a.download = fileName || 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    setIsModified(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Start screen
  if (!content) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#3B82F6' : '#E2E8F0'}`,
            borderRadius: '20px', minHeight: '280px', padding: '48px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', textAlign: 'center',
            background: isDragActive ? '#EFF6FF' : '#FAFAFA',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />
          <span style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>📝</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '8px' }}>
            {isDragActive ? 'Відпусти...' : 'Відкрий Markdown файл'}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>Перетягни .md файл або клікни</div>
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#bbb', fontSize: '13px' }}>
          — або —
        </div>

        <button
          onClick={() => { setContent('# Новий документ\n\nПочни писати тут...'); setFileName('new-document.md'); }}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            border: '1px solid #E2E8F0', background: 'white', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'white')}
        >
          ✨ Створити новий документ
        </button>
      </div>
    );
  }

  // Editor
  return (
    <div style={{ width: '95%', margin: '0 auto' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: 'white',
        border: '1px solid #E8E8E8', borderRadius: '12px 12px 0 0',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📄</span>
          <input
            value={fileName}
            onChange={e => { setFileName(e.target.value); setIsModified(true); }}
            style={{ fontSize: '15px', fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', minWidth: '200px' }}
          />
          {isModified && (
            <span style={{ fontSize: '11px', color: '#F59E0B', background: '#FFFBEB', padding: '2px 8px', borderRadius: '99px', border: '1px solid #FDE68A' }}>
              Змінено
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '3px', background: '#F0F0F0', padding: '3px', borderRadius: '10px' }}>
          {([['edit', '✏️ Редагувати'], ['split', '⬛ Split'], ['preview', '👁 Перегляд']] as [ViewMode, string][]).map(([m, l]) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500,
                background: viewMode === m ? 'white' : 'transparent',
                color: viewMode === m ? '#1a1a1a' : '#888',
                boxShadow: viewMode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#bbb' }}>
            {content.split('\n').length} рядків · {content.length} символів
          </span>
          <label style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#555', fontWeight: 500 }}>
            📂 Відкрити
            <input
              type="file"
              accept=".md,.markdown"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFileName(file.name);
                const r = new FileReader();
                r.onload = ev => setContent((ev.target?.result as string) ?? '');
                r.readAsText(file, 'UTF-8');
              }}
            />
          </label>
          <button
            type="button"
            aria-label="Копіювати Markdown у буфер обміну"
            onClick={handleCopy}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
              background: 'white', color: '#555', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
            }}
          >
            📋 Копіювати Markdown
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: saved ? '#10B981' : '#1a1a1a',
              color: 'white', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Збережено' : '↓ Зберегти .md'}
          </button>
          <button
            onClick={() => { setContent(''); setFileName(''); setIsModified(false); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #FFE0E0', background: '#FFF5F5', color: '#DC2626', fontSize: '13px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ border: '1px solid #E8E8E8', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {viewMode === 'edit' && (
          <MDEditor
            value={content}
            onChange={v => { setContent(v ?? ''); setIsModified(true); }}
            height={620}
            preview="edit"
            data-color-mode="light"
            style={{ borderRadius: 0 }}
          />
        )}
        {viewMode === 'split' && (
          <MDEditor
            value={content}
            onChange={v => { setContent(v ?? ''); setIsModified(true); }}
            height={620}
            preview="live"
            data-color-mode="light"
            style={{ borderRadius: 0 }}
          />
        )}
        {viewMode === 'preview' && (
          <div style={{ minHeight: '620px', padding: '48px 64px', background: 'white', overflowY: 'auto' }}>
            <MDPreview source={content} style={{ background: 'transparent' }} />
          </div>
        )}
      </div>
    </div>
  );
}
