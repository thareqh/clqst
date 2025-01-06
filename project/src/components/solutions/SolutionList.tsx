import { motion } from 'framer-motion';
import { SolutionCard } from './SolutionCard';

const solutions = [
  {
    title: 'Creative Teams',
    description: 'Streamlined collaboration for design and development teams'
  },
  {
    title: 'Project Incubation',
    description: 'Turn innovative ideas into successful projects'
  },
  {
    title: 'Enterprise',
    description: 'Advanced security and customization for large organizations'
  }
];

export function SolutionList() {
  return (
    <div className="space-y-8">
      {solutions.map((solution, index) => (
        <motion.div
          key={solution.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SolutionCard {...solution} />
        </motion.div>
      ))}
    </div>
  );
}