import { motion } from 'framer-motion';
import { Container } from '../layout/Container';
import { GradientText } from '../ui/GradientText';

const stats = [
  { label: 'Active Users', value: '50+' },
  { label: 'Projects Created', value: '100+' },
  { label: 'Team Satisfaction', value: '95%' },
  { label: 'Countries', value: '8+' },
];

export function Stats() {
  return (
    <section className="py-16 md:py-24 bg-black text-white">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-normal mb-2">
                <GradientText direction="tr">{stat.value}</GradientText>
              </div>
              <div className="text-sm sm:text-base text-gray-400 font-light">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}