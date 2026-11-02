"use client";

import SiteHeader from "../components/home/SiteHeader";
import HeroSection from "../components/home/HeroSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import PlannerSection from "../components/home/PlannerSection";
import MapCtaSection from "../components/home/MapCtaSection";
import SiteFooter from "../components/home/SiteFooter";
import { usePlan } from "../components/home/usePlan";

export default function Home() {
  const plan = usePlan();

  return (
    <>
      <SiteHeader />
      <main id="konten-utama" tabIndex={-1}>
        <HeroSection />
        <HowItWorksSection />
        <PlannerSection plan={plan} />
        <MapCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
