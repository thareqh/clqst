import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';

const features = [
  {
    title: "Merit-based Recognition",
    description: "Get recognized for your contributions and expertise",
    icon: "🏆"
  },
  {
    title: "Skill Matching",
    description: "Find the perfect collaborators for your projects",
    icon: "🤝"
  },
  {
    title: "Knowledge Sharing",
    description: "Learn and grow with the community",
    icon: "📚"
  }
];

export function Community() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeader 
          title="Community" 
          subtitle="Connect → Grow → Succeed" 
        />
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}