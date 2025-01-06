import { motion } from 'framer-motion';

interface PricingHeaderProps {
  name: string;
  price: string;
  description: string;
}

export function PricingHeader({ name, price, description }: PricingHeaderProps) {
  return (
    <div className="mb-8">
      <motion.h3 
        className="text-xl font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {name}
      </motion.h3>
      
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-light">$</span>
        <span className="text-5xl font-light">{price}</span>
        <span className="text-gray-400">/mo</span>
      </div>
      
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}