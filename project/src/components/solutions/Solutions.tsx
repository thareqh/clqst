import { Container } from '../layout/Container';
import { SolutionList } from './SolutionList';
import { SectionHeader } from '../ui/SectionHeader';

export function Solutions() {
  return (
    <section id="solutions" className="py-24">
      <Container>
        <SectionHeader 
          title="Solutions" 
          subtitle="Built for scale →" 
        />
        <SolutionList />
      </Container>
    </section>
  );
}