# MarkShift

**Універсальний конвертер файлів у Markdown — і навпаки.** Завантажте документ,
отримайте чистий `.md`, або перетворіть Markdown у потрібний формат. Безкоштовно,
швидко та приватно: файли обробляються **в пам'яті** й ніколи не зберігаються на сервері.

🔗 **Live:** https://markshift.vercel.app

## Можливості

- **29+ форматів** в обидва боки через єдиний Markdown-центр.
- **Пакетна конвертація** — завантажте кілька файлів і завантажте результат у `.zip`.
- **OCR для сканованих PDF** (українська + англійська) через Tesseract.
- **Живий перегляд** результату з підсвічуванням коду.
- **Темна тема**, адаптивний дизайн, без реєстрації.

### У Markdown

DOCX, DOC, PDF (з OCR), ODT, RTF, HTML, CSV, XLSX, XLS, PPTX, JSON, YAML, TOML,
XML, reStructuredText, AsciiDoc, LaTeX, EPUB, TXT.

### З Markdown

HTML, TXT, PDF, DOCX, reStructuredText, JSON, CSV, EPUB.

## Стек

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · framer-motion · sonner
- Конвертери: `mammoth`, `pdf-parse`, `tesseract.js`, `@napi-rs/canvas`, `xlsx`,
  `docx`, `jspdf`, `jszip`, `asciidoctor`, `restructured`, `marked`,
  `sanitize-html`, `fast-xml-parser`, `smol-toml`, `word-extractor`, `@iarna/rtf-to-html`.

## Локальний запуск

```bash
npm install
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production-збірка
npm run start   # запуск production-збірки
```

## Деплой

Проєкт розгорнуто на Vercel. Маршрут `/api/convert` обмежено `maxDuration = 60`
(ліміт Vercel Hobby).

> **⚠️ Обмеження OCR на безкоштовному тарифі:** великі скановані PDF можуть
> перевищити 60 секунд (перший OCR-запит ще й завантажує мовні дані Tesseract).
> Такі файли завершаться помилкою тайм-ауту. Для важких сканів використовуйте
> менші файли або власний хостинг із вищим лімітом.

## Приватність

Усі файли конвертуються **виключно в пам'яті** на час запиту й не записуються на
диск і не логуються. Жодної реєстрації чи зберігання.

## Ліцензія

MIT
