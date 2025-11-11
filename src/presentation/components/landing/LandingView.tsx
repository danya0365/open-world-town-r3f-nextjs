"use client";

import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TechStackSection } from "./TechStackSection";
import { CTASection } from "./CTASection";

/**
 * Landing Page View Component
 * Displays the main landing page with all sections
 * Follows Atomic Design pattern - Page level
 */
export function LandingView() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <CTASection />
    </>
  );
}
