import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';
import { SlideIn } from '../ui/animations/SlideIn';
import { Typewriter } from '../ui/animations/Typewriter';

export function BlogHero() {
  return (
    <section className="relative py-24 bg-gray-50">
      <Container>
        <div className="max-w-3xl">
          <SlideIn>
            <h1 className="text-5xl font-normal mb-6">
              Stories from the <GradientText>Cliquest</GradientText> Team
            </h1>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="text-xl text-gray-600">
              <Typewriter 
                text="Insights, updates, and thoughts on building the future of creative collaboration." 
                speed={0.03}
              />
            </p>
          </SlideIn>
        </div>
      </Container>
    </section>
  );
}