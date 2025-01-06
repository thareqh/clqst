import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { SectionHeader } from '../ui/SectionHeader';

const steps = [
  {
    title: "Create & Plan",
    description: "Set up your project space and define your goals",
    icon: "📝"
  },
  {
    title: "Collaborate",
    description: "Work together in real-time with your team",
    icon: "👥"
  },
  {
    title: "Track & Analyze",
    description: "Monitor progress and make data-driven decisions",
    icon: "📊"
  },
  {
    title: "Deliver",
    description: "Complete projects successfully and exceed expectations",
    icon: "🚀"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <SectionHeader 
          title="How It Works" 
          subtitle="Simple Steps → Big Impact" 
        />
        <div className="grid md:grid-cols-4 gap-8 mt-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}