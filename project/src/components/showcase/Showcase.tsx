import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';
import { ShowcaseGrid } from './ShowcaseGrid';
import { GradientBlob } from '../ui/GradientBlob';

export function Showcase() {
  return (
    <section className="relative py-24 bg-gray-900 text-white">
      <GradientBlob className="absolute left-0 top-0 w-[600px] h-[600px] opacity-10" />
      <Container>
        <SectionHeader 
          title="Why Cliquest?" 
          subtitle="Built for → Performance" 
        />
        <ShowcaseGrid />
      </Container>
    </section>
  );
}