import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';
import { SlideIn } from '../ui/animations/SlideIn';

export function AccessHero() {
  return (
    <section className="relative py-24 bg-gray-50">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <SlideIn>
            <h1 className="text-5xl font-normal mb-6">
              Choose Your Way to <GradientText>Access Cliquest</GradientText>
            </h1>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="text-xl text-gray-600">
              Whether you prefer mobile or web, we've got you covered. Select your preferred platform to get started.
            </p>
          </SlideIn>
        </div>
      </Container>
    </section>
  );
}