import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
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
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
