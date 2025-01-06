import { motion } from 'framer-motion';
import { PricingFeature } from './PricingFeature';
import { PricingHeader } from './PricingHeader';
import { PricingCTA } from './PricingCTA';
import { MetallicAccent } from './MetallicAccent';

interface PremiumPricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export function PremiumPricingCard({
  name,
  price,
  description,
  features,
  isPopular = false
}: PremiumPricingCardProps) {
  return (
    <motion.div
      className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-8 text-white overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8 }}
    >
      <MetallicAccent />
      
      {isPopular && (
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 text-xs bg-gradient-to-r from-amber-400 to-amber-300 text-gray-900 rounded-full font-medium">
            Most Popular
          </span>
        </div>
      )}

      <PricingHeader
        name={name}
        price={price}
        description={description}
      />

      <div className="space-y-4 mb-8">
        {features.map((feature) => (
          <PricingFeature key={feature} feature={feature} />
        ))}
      </div>

      <PricingCTA isPopular={isPopular} />
    </motion.div>
  );
}