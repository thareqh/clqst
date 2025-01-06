import { motion } from 'framer-motion';
import { GradientText } from '../ui/GradientText';

const features = [
  {
    title: "Real-time Updates",
    description: "See changes instantly as your team collaborates",
    metric: "0.1s",
    metricLabel: "Sync Time"
  },
  {
    title: "Smart Automation",
    description: "Automate repetitive tasks and workflows",
    metric: "10h+",
    metricLabel: "Saved Weekly"
  },
  {
    title: "Team Analytics",
    description: "Track progress and identify bottlenecks",
    metric: "99%",
    metricLabel: "Accuracy"
  }
];

export function ShowcaseGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="bg-gray-900 p-6 rounded-2xl border border-gray-800"
        >
          <div className="text-3xl font-bold mb-2">
            <GradientText>{feature.metric}</GradientText>
          </div>
          <div className="text-sm text-gray-400 mb-4">{feature.metricLabel}</div>
          <h3 className="font-medium mb-2 text-white">{feature.title}</h3>
          <p className="text-sm text-gray-400">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}