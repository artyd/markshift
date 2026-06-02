import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/constants/site";

const DESCRIPTION =
  "Конвертуйте будь-який формат (DOCX, PDF, HTML, CSV, JSON, EPUB та інші) у Markdown і навпаки. Безкоштовно, швидко, приватно — файли не зберігаються на сервері.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "MarkShift — Універсальний конвертер файлів у Markdown",
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    "markdown конвертер",
    "конвертер у markdown",
    "docx to markdown",
    "pdf to markdown",
    "html to markdown",
    "csv to markdown",
    "markdown to html",
    "markdown to pdf",
    "markdown to docx",
    "epub to markdown",
  ],
  openGraph: {
    title: "MarkShift — Конвертер файлів у Markdown",
    description: DESCRIPTION,
    url: SITE.url,
    siteName: SITE.name,
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarkShift — Конвертер файлів у Markdown",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
