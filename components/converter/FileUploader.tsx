"use client";

import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { getExtension } from "@/lib/utils/fileDetector";
import { ACCEPTED_SOURCE_EXTS } from "@/lib/constants/formats";
import { LIMITS } from "@/lib/constants/limits";

interface FileUploaderProps {
  files: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (name: string) => void;
  onConvert: () => void;
  isConverting: boolean;
  onReject: (message: string) => void;
}

function getIcon(name: string) {
  if (name.endsWith('.pdf'))  return '📕';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return '📄';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return '📊';
  if (name.endsWith('.pptx')) return '📽️';
  if (name.endsWith('.html') || name.endsWith('.htm')) return '🌐';
  if (name.endsWith('.csv'))  return '📊';
  if (name.endsWith('.json')) return '{}';
  if (name.endsWith('.md'))   return '📝';
  return '📄';
}

export function FileUploader({
  files,
  onAddFiles,
  onRemoveFile,
  onConvert,
  isConverting,
  onReject,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const code = rejections[0].errors[0]?.code;
        const message =
          code === "file-too-large"
            ? `Файл завеликий. Максимум ${LIMITS.MAX_FILE_SIZE / (1024 * 1024)} МБ.`
            : code === "too-many-files"
            ? "Максимум 20 файлів за раз."
            : "Не вдалося прийняти файл.";
        onReject(message);
        return;
      }
      const valid: File[] = [];
      for (const f of accepted) {
        const ext = getExtension(f.name);
        if (ACCEPTED_SOURCE_EXTS.includes(ext)) valid.push(f);
        else onReject(`Формат .${ext || "?"} не підтримується (${f.name}).`);
      }
      if (valid.length > 0) onAddFiles(valid);
    },
    [onAddFiles, onReject],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: LIMITS.MAX_FILE_SIZE,
    maxFiles: 20,
    multiple: true,
  });

  // IDLE state
  if (files.length === 0) {
    return (
      <div
        {...getRootProps()}
        style={{
          width: '100%',
          border: isDragActive ? '2px dashed #111111' : '2px dashed #CCCCCC',
          borderRadius: '16px',
          padding: '72px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: isDragActive ? '#F5F5F5' : '#FAFAFA',
          transition: 'all 0.2s ease',
          minHeight: '260px',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <svg
          width="52" height="52" viewBox="0 0 24 24" fill="none"
          stroke={isDragActive ? '#111111' : '#BBBBBB'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginBottom: '20px', transition: 'stroke 0.2s' }}
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
        <div style={{ fontSize: '17px', fontWeight: 600, color: '#111111', marginBottom: '8px' }}>
          {isDragActive ? 'Відпусти файли...' : 'Перетягни або клікни для завантаження'}
        </div>
        <div style={{ fontSize: '13px', color: '#AAAAAA' }}>
          PDF, DOCX, XLSX, PPTX, HTML, CSV та інші · до 50МБ
        </div>
      </div>
    );
  }

  // HAS FILES state
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '20px',
        scrollbarWidth: 'none',
        justifyContent: 'center',
        flexWrap: 'wrap',
      } as React.CSSProperties}>
        {files.map((file) => {
          const ext = file.name.split('.').pop()?.toLowerCase() ?? 'file';
          return (
            <div key={`${file.name}-${file.size}`} style={{
              flexShrink: 0, width: '120px',
              border: '1px solid #E0E0E0', borderRadius: '10px',
              padding: '12px 10px', background: '#FFFFFF',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
            }}>
              <button
                onClick={() => onRemoveFile(file.name)}
                aria-label={`Видалити ${file.name}`}
                style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '18px', height: '18px',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', color: '#BBBBBB',
                  fontSize: '12px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0F0F0'; e.currentTarget.style.color = '#111'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#BBBBBB'; }}
              >✕</button>

              <span style={{ fontSize: '28px' }}>{getIcon(file.name)}</span>

              <span style={{
                fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
                color: '#111', background: '#F0F0F0',
                padding: '2px 6px', borderRadius: '4px',
              }}>.{ext}</span>

              <span style={{
                fontSize: '11px', color: '#555', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', width: '100%',
              }}>
                {file.name.length > 12 ? file.name.slice(0, 10) + '...' : file.name}
              </span>

              <span style={{ fontSize: '10px', color: '#AAAAAA' }}>
                {file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(0)}КБ`
                  : `${(file.size / (1024 * 1024)).toFixed(1)}МБ`}
              </span>
            </div>
          );
        })}

        {/* "+" add more card */}
        <div
          {...getRootProps()}
          style={{
            flexShrink: 0, width: '120px', minHeight: '120px',
            border: '1px dashed #CCCCCC', borderRadius: '10px',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.background = '#F8F8F8'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#CCCCCC'; e.currentTarget.style.background = 'transparent'; }}
        >
          <input {...getInputProps()} />
          <span style={{ fontSize: '24px', color: '#CCCCCC' }}>+</span>
          <span style={{ fontSize: '11px', color: '#AAAAAA' }}>Додати</span>
        </div>
      </div>

      <button
        onClick={onConvert}
        disabled={isConverting}
        style={{
          width: '100%', padding: '16px',
          background: '#111111', color: '#FFFFFF',
          border: 'none', borderRadius: '10px',
          fontSize: '15px', fontWeight: 700,
          cursor: isConverting ? 'not-allowed' : 'pointer',
          opacity: isConverting ? 0.6 : 1,
          transition: 'all 0.2s', letterSpacing: '0.3px',
        }}
      >
        {isConverting
          ? 'Конвертую...'
          : `Конвертувати ${files.length > 1 ? `${files.length} файли` : 'файл'} →`}
      </button>
    </div>
  );
}
