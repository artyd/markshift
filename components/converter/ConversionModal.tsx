"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { marked } from "marked";
import { X, Download } from "lucide-react";
import type { ConversionSuccess } from "@/types/conversion";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type ViewMode = "preview" | "split" | "edit";

interface ConversionModalProps {
  result: ConversionSuccess;
  onClose: () => void;
  onDownload: (result: ConversionSuccess) => void;
}

export function ConversionModal({ result, onClose, onDownload }: ConversionModalProps) {
  const [view, setView] = useState<ViewMode>("preview");
  const [content, setContent] = useState(result.content);
  const backdropRef = useRef<HTMLDivElement>(null);

  const isMarkdown = result.mimeType === "text/markdown" || result.filename.endsWith(".md");

  const rendered = useMemo(
    () => (isMarkdown && content ? (marked.parse(content, { gfm: true, breaks: true }) as string) : ""),
    [content, isMarkdown],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const VIEW_LABELS: { id: ViewMode; label: string }[] = [
    { id: "preview", label: "👁 Перегляд" },
    { id: "split",   label: "⬛ Split" },
    { id: "edit",    label: "✏️ Редагувати" },
  ];

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      <div
        style={{
          width: "80vw", height: "85vh",
          background: "hsl(var(--background))",
          borderRadius: "20px",
          border: "1px solid hsl(var(--border))",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}
      >
        <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "hsl(var(--foreground))" }}>
            {result.filename}
          </span>

          <div style={{ display: "flex", gap: "4px" }}>
            {VIEW_LABELS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "13px",
                  border: "1px solid hsl(var(--border))",
                  background: view === v.id ? "hsl(var(--foreground))" : "transparent",
                  color: view === v.id ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                  cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => onDownload({ ...result, content })}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px", fontSize: "13px",
                border: "1px solid hsl(var(--border))",
                background: "transparent", color: "hsl(var(--foreground))",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--secondary))")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Download size={14} />
              Завантажити
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "32px", height: "32px", borderRadius: "8px", border: "none",
                background: "transparent", color: "hsl(var(--muted-foreground))",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--destructive)/0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              aria-label="Закрити"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {view === "preview" && (
            <div style={{ flex: 1, overflow: "auto", padding: "32px 48px" }}>
              {isMarkdown ? (
                <div
                  className="md-preview"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              ) : (
                <pre style={{
                  fontFamily: "monospace", fontSize: "13px", whiteSpace: "pre-wrap",
                  color: "hsl(var(--foreground))", lineHeight: 1.7,
                }}>
                  {content}
                </pre>
              )}
            </div>
          )}

          {view === "split" && (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
              <div style={{
                borderRight: "1px solid hsl(var(--border))",
                overflow: "hidden",
              }}>
                <MDEditor
                  value={content}
                  onChange={v => setContent(v ?? "")}
                  preview="edit"
                  height="100%"
                  data-color-mode="light"
                  style={{ borderRadius: 0, boxShadow: "none", height: "100%" }}
                />
              </div>
              <div style={{ overflow: "auto", padding: "32px" }}>
                <div
                  className="md-preview"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              </div>
            </div>
          )}

          {view === "edit" && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <MDEditor
                value={content}
                onChange={v => setContent(v ?? "")}
                preview="edit"
                height="100%"
                data-color-mode="light"
                style={{ borderRadius: 0, boxShadow: "none", height: "100%" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
