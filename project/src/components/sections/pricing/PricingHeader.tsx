import { motion } from 'framer-motion';
import { GradientText } from '../../ui/GradientText';

export function PricingHeader() {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-3xl font-normal mb-4">
          Simple, <GradientText>Transparent</GradientText> Pricing
        </h2>
        <p className="text-gray-600">
          Choose the perfect plan for your team's needs. All plans include core features.
        </p>
      </motion.div>
    </div>
  );
}