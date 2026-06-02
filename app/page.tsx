"use client";

import { FileText, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ConverterZone } from "@/components/converter/ConverterZone";
import { ConverterBoundary } from "@/components/converter/ConverterBoundary";
import { MarkdownReader } from "@/components/reader/MarkdownReader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section id="converter" className="scroll-mt-24 px-4 pb-8">
          <Tabs defaultValue="convert" className="mx-auto w-full max-w-5xl items-center">
            <TabsList className="mb-6">
              <TabsTrigger value="convert">
                <FileText className="size-4" />
                Конвертувати файл
              </TabsTrigger>
              <TabsTrigger value="read">
                <BookOpen className="size-4" />
                Читати Markdown
              </TabsTrigger>
            </TabsList>
            <TabsContent value="convert" className="w-full">
              <ConverterBoundary>
                <ConverterZone />
              </ConverterBoundary>
            </TabsContent>
            <TabsContent value="read" className="w-full">
              <MarkdownReader />
            </TabsContent>
          </Tabs>
        </section>
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
