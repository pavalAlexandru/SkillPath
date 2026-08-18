import { FeatureSection } from "@/components/homepage/FeatureSection";
import { HeroSection } from "@/components/homepage/HeroSection";
import { PageHeader } from "@/components/homepage/PageHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <PageHeader />
      <HeroSection />
      <FeatureSection />
    </main>
  );
}
