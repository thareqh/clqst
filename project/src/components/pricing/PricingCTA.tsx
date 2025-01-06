import { motion } from 'framer-motion';
import { ButtonRipple } from '../ui/animations/ButtonRipple';

interface PricingCTAProps {
  isPopular?: boolean;
}

export function PricingCTA({ isPopular = false }: PricingCTAProps) {
  return (
    <ButtonRipple className="w-full">
      <motion.button
        className={`w-full py-3 rounded-xl font-medium transition-colors ${
          isPopular
            ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-gray-900 hover:from-amber-300 hover:to-amber-200'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Get Started
      </motion.button>
    </ButtonRipple>
  );
}