import HeroSection from './sections/HeroSection';

/**
 * Composes the public marketing landing page from independent section
 * components under ./sections — additional sections (features, pricing,
 * testimonials, footer, etc.) land here as the real landing page is built out.
 */
export default function LandingPage() {
  return <HeroSection />;
}
