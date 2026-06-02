"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { GithubIcon } from "@/components/GithubIcon";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/constants/site";

const NAV_LINKS = [
  { href: "#formats", label: "Формати" },
  { href: "#how", label: "Як це працює" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo size={32} />
          <span className="text-lg">
            Mark<span className="text-gradient">Shift</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Меню"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="flex items-center gap-2">
              <Logo size={28} />
              <span>
                Mark<span className="text-gradient">Shift</span>
              </span>
            </SheetTitle>
            <nav className="mt-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <SheetClose
                  key={l.href}
                  render={
                    <Link
                      href={l.href}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "lg",
                        className: "justify-start",
                      })}
                    />
                  }
                >
                  {l.label}
                </SheetClose>
              ))}
              <a
                href={SITE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                  className: "justify-start",
                })}
              >
                <GithubIcon className="size-4" />
                GitHub
              </a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
