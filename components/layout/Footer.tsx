import { Bug } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GithubIcon } from "@/components/GithubIcon";
import { SITE, GITHUB_ISSUES_URL } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div>
            <p className="font-semibold">
              Mark<span className="text-gradient">Shift</span>
            </p>
            <p className="text-sm text-muted-foreground">{SITE.tagline}</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a
            href="#formats"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Формати
          </a>
          <a
            href="#how"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Як це працює
          </a>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
          <a
            href={GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bug className="size-4" />
            Повідомити про помилку
          </a>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>🔒 Файли не зберігаються на сервері · обробка в пам&apos;яті</p>
          <p>© {new Date().getFullYear()} MarkShift · MIT License</p>
        </div>
      </div>
    </footer>
  );
}
