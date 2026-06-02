import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { FormatGrid } from "@/components/home/FormatGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ConverterZone } from "@/components/converter/ConverterZone";
import { ConverterBoundary } from "@/components/converter/ConverterBoundary";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <section className="px-4 pb-8">
          <ConverterBoundary>
            <ConverterZone />
          </ConverterBoundary>
        </section>
        <FormatGrid />
        <FeaturesGrid />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
