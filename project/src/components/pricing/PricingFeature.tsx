import { motion } from 'framer-motion';

interface PricingFeatureProps {
  feature: string;
}

export function PricingFeature({ feature }: PricingFeatureProps) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 flex items-center justify-center">
        <span className="text-gray-900 text-xs">✓</span>
      </div>
      <span className="text-gray-300">{feature}</span>
    </motion.div>
  );
}