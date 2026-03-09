import './Landing.css';
import HeroSection from '../components/landing/HeroSection';
import StatsBar from '../components/landing/StatsBar';
import HowItWorks from '../components/landing/HowItWorks';
import BentoGrid from '../components/landing/BentoGrid';
import Testimonials from '../components/landing/Testimonials';
import RoadmapTimeline from '../components/landing/RoadmapTimeline';
import FAQ from '../components/landing/FAQ';
import Pricing from '../components/landing/Pricing';
import FooterCTA from '../components/landing/FooterCTA';

// FeatureCards is NOT imported — retired in favour of BentoGrid

export default function Landing() {
  return (
    <main className="page-landing">
      <HeroSection />
      <StatsBar />
      <section id="how-it-works"><HowItWorks /></section>
      <BentoGrid />
      <section id="testimonials"><Testimonials /></section>
      <section id="roadmap"><RoadmapTimeline /></section>
      <section id="faq"><FAQ /></section>
      <section id="pricing"><Pricing /></section>
      <FooterCTA />
    </main>
  );
}
