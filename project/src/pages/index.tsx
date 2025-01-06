import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Features } from '../components/features/Features';
import { HowItWorks } from '../components/pages/HowItWorks';
import { Stats } from '../components/sections/Stats';
import { Solutions } from '../components/solutions/Solutions';
import { Pricing } from '../components/sections/Pricing';
import { Testimonials } from '../components/testimonials/Testimonials';
import { Footer } from '../components/footer/Footer';

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <Header />
      <main className="pt-20">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Solutions />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}