import { motion, useScroll, useTransform } from 'framer-motion';
import { Container } from '../layout/Container';
import { useInView } from 'react-intersection-observer';
import { useRef } from 'react';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const benefits = [
  {
    icon: UserGroupIcon,
    title: 'Diverse Community',
    description: 'Connect with developers, designers, entrepreneurs, and other creative minds from around the world.'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Meaningful Interactions',
    description: 'Engage in discussions, share knowledge, and receive valuable feedback from experienced members.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Global Opportunities',
    description: 'Access international projects and collaborate with teams across different time zones and cultures.'
  },
  {
    icon: SparklesIcon,
    title: 'Innovation Network',
    description: 'Be part of a network that constantly pushes boundaries and creates innovative solutions.'
  }
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0], index: number }) {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="group relative"
    >
      <div className="relative p-8 bg-white border border-gray-100 rounded-lg transition-all duration-200 hover:border-gray-200">
        <div className="mb-6 inline-block">
          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
            <benefit.icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        <h3 className="text-xl font-medium mb-3 text-gray-900">
          {benefit.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {benefit.description}
        </p>
      </div>
    </motion.div>
  );
}

export function Community() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[size:48px_48px]" />
      </div>

      <Container className="relative">
        <motion.div 
          style={{ y }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-semibold mb-6 text-gray-900 tracking-tight"
          >
            Join Our Community
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Be part of a global network of creators and innovators
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={benefit.title} 
              benefit={benefit} 
              index={index} 
            />
          ))}
        </div>

        {/* Community Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 p-8 bg-white border border-gray-100 rounded-lg text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-medium mb-6 text-gray-900">
              A Growing Community of Innovators
            </h3>
            <p className="text-gray-600 mb-8">
              Join thousands of creators who are already turning their ideas into reality through collaboration and innovation.
            </p>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Join the Community
            </motion.button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}