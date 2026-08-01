import NavBar from './sections/NavBar';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import CategoriesSection from './sections/CategoriesSection';
import RecentJobsSection from './sections/RecentJobsSection';
import FeaturesSection from './sections/FeaturesSection';
import CtaSection from './sections/CtaSection';
import FooterSection from './sections/FooterSection';

/**
 * Composes the public marketing landing page from independent section
 * components under ./sections.
 */
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <RecentJobsSection />
      <FeaturesSection />
      <CtaSection />
      <FooterSection />
    </>
  );
}
