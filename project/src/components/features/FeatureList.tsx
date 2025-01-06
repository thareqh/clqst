import { motion } from 'framer-motion';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    title: "Project Space System",
    description: "Customizable digital workspaces with integrated collaboration tools"
  },
  {
    title: "Real-time Collaboration",
    description: "Seamless communication and live project updates"
  },
  {
    title: "Resource Management",
    description: "Centralized asset storage with version control"
  },
  {
    title: "Community Features",
    description: "Merit-based recognition and skill-based matching"
  }
];

export function FeatureList() {
  return (
    <div className="space-y-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <FeatureCard {...feature} />
        </motion.div>
      ))}
    </div>
  );
}