import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';
import { SlideIn } from '../ui/animations/SlideIn';
import { Typewriter } from '../ui/animations/Typewriter';

export function AboutHero() {
  return (
    <section className="relative py-24 bg-gray-50">
      <Container>
        <div className="max-w-3xl">
          <SlideIn>
            <h1 className="text-5xl font-normal mb-6">
              We're Building The Future of{' '}
              <GradientText>Creative Collaboration</GradientText>
            </h1>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="text-xl text-gray-600 mb-8">
              <Typewriter 
                text="Cliquest is revolutionizing how teams work together, one project at a time." 
                speed={0.03} 
              />
            </p>
          </SlideIn>
        </div>
      </Container>
    </section>
  );
}