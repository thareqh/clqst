import { Container } from './layout/Container';
import { ProjectCard } from './ProjectCard';

const solutions = [
  {
    name: 'Startups',
    description: 'Scale your workflow as you grow',
    image: '/startup-icon.png'
  },
  {
    name: 'Enterprise',
    description: 'Advanced security and control',
    image: '/enterprise-icon.png'
  }
];

export function Projects() {
  return (
    <Container className="py-24">
      <h2 className="text-2xl font-normal mb-12">Solutions</h2>
      <div className="space-y-8">
        {solutions.map((solution) => (
          <ProjectCard key={solution.name} {...solution} />
        ))}
      </div>
    </Container>
  );
}