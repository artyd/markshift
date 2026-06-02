import { Logo } from "@/components/Logo";
import { GithubIcon } from "@/components/GithubIcon";
import { SITE } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row md:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Logo size={24} />
          <span className="font-medium text-foreground">MarkShift</span>
          <span>· © {new Date().getFullYear()} · MIT</span>
        </div>
        <a
          href={SITE.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <GithubIcon className="size-4" />
          GitHub
        </a>
      </div>
    </footer>
  );
}
