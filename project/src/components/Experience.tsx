import { motion } from 'framer-motion';
import { Container } from './layout/Container';
import { ExperienceCard } from './ExperienceCard';
import { GradientBlob } from './ui/GradientBlob';

const features = [
  {
    company: 'Task Management',
    logo: '/task-icon.svg',
    description: 'Organize and track tasks effortlessly'
  },
  {
    company: 'Team Collaboration',
    logo: '/team-icon.svg',
    description: 'Work together in real-time'
  },
  {
    company: 'Analytics',
    logo: '/analytics-icon.svg',
    description: 'Make data-driven decisions'
  },
  {
    company: 'Automation',
    logo: '/automation-icon.svg',
    description: 'Streamline repetitive workflows'
  }
];

export function Experience() {
  return (
    <Container className="py-24 relative">
      <GradientBlob className="absolute left-0 bottom-0 w-[400px] h-[400px] opacity-10" />
      <div className="flex justify-between items-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-2xl font-normal"
        >
          Core Features
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-600"
        >
          Designed for <span className="font-mono">→</span> Teams
        </motion.div>
      </div>
      <div className="space-y-8 relative">
        {features.map((feature, index) => (
          <motion.div
            key={feature.company}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ExperienceCard {...feature} />
          </motion.div>
        ))}
      </div>
    </Container>
  );
}