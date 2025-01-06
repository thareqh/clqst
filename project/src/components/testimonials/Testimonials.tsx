import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';
import { TestimonialGrid } from './TestimonialGrid';
import { GradientBlob } from '../ui/GradientBlob';

export function Testimonials() {
  return (
    <section className="relative py-24">
      <GradientBlob className="absolute right-0 top-1/2 w-[500px] h-[500px] opacity-10" />
      <Container>
        <SectionHeader 
          title="Testimonials" 
          subtitle="Trusted by → Teams" 
        />
        <TestimonialGrid />
      </Container>
    </section>
  );
}