import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';
import { SlideIn } from '../ui/animations/SlideIn';
import { Typewriter } from '../ui/animations/Typewriter';

export function ContactHero() {
  return (
    <section className="relative py-24 bg-gray-50">
      <Container>
        <div className="max-w-3xl">
          <SlideIn>
            <h1 className="text-5xl font-normal mb-6">
              Let's <GradientText>Connect</GradientText>
            </h1>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="text-xl text-gray-600">
              <Typewriter 
                text="Have a question or want to join our journey? We'd love to hear from you." 
                speed={0.03}
              />
            </p>
          </SlideIn>
        </div>
      </Container>
    </section>
  );
}