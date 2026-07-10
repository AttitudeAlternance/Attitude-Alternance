import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Hero } from "@/components/landing/Hero";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { Benefits } from "@/components/landing/Benefits";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA, Footer } from "@/components/landing/CTAFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-paper">
      <PublicNavbar />
      <Hero />
      <DemoVideo />
      <ProblemSolution />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
