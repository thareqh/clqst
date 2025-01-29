import { motion } from 'framer-motion';

export function PricingHeader() {
  return (
    <div className="text-center mb-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-semibold mb-6 text-zinc-900 tracking-tight"
      >
        Choose Your Journey
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-zinc-600 text-lg max-w-2xl mx-auto"
      >
        Start for free and scale as your projects grow. No hidden fees, no long-term commitments.
      </motion.p>
    </div>
  );
}