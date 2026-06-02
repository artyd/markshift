"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/** Catches render-time crashes in the converter so the page stays usable. */
export class ConverterBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[ConverterBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center">
          <AlertTriangle className="size-10 text-destructive" />
          <p className="font-medium">Сталася неочікувана помилка в конвертері.</p>
          <Button variant="secondary" onClick={() => this.setState({ hasError: false })}>
            Перезавантажити
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
