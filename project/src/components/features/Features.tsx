import { Container } from '../layout/Container';
import { FeatureList } from './FeatureList';
import { SectionHeader } from '../ui/SectionHeader';

export function Features() {
  return (
    <section id="features" className="py-24">
      <Container>
        <SectionHeader 
          title="Core Features" 
          subtitle="Designed for → Teams" 
        />
        <FeatureList />
      </Container>
    </section>
  );
}