import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { GradientText } from '../../ui/GradientText';
import { HoverScale } from '../../ui/animations/HoverScale';
import { PremiumCard } from '../../ui/animations/PremiumCard';
import { PremiumReveal } from '../../ui/animations/PremiumReveal';
import { SITE_VERSION } from '../../../config/siteConfig';

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
  };
  index: number;
  onSelect: (planName: string) => void;
}

export function PricingCard({ plan, index, onSelect }: PricingCardProps) {
  const isPopular = index === 1;
  const buttonText = SITE_VERSION === 'web-only' 
    ? 'Start Free Trial'
    : 'Get Started';

  return (
    <PremiumCard>
      <PremiumReveal>
        <div className="p-8">
          {isPopular && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4"
            >
              <span className="px-3 py-1 text-xs bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-medium">
                Most Popular
              </span>
            </motion.div>
          )}

          <div className="mb-6">
            <h3 className="text-lg md:text-xl mb-2">
              <GradientText>{plan.name}</GradientText>
            </h3>
            <div className="flex items-baseline gap-1 mb-3">
              {plan.price === 'Custom' ? (
                <span className="text-2xl md:text-4xl font-light">Custom</span>
              ) : (
                <>
                  <span className="text-2xl md:text-4xl font-light">${plan.price}</span>
                  <span className="text-sm md:text-base text-gray-500">/month</span>
                </>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-600 font-light">{plan.description}</p>
          </div>

          <ul className="space-y-3 md:space-y-4 mb-8">
            {plan.features.map((feature) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-gray-900">✓</span>
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <HoverScale>
            <Button
              variant={isPopular ? 'primary' : 'outline'}
              className="w-full justify-center text-sm"
              onClick={() => onSelect(plan.name)}
            >
              {plan.price === 'Custom' ? 'Contact Sales' : buttonText}
            </Button>
          </HoverScale>
        </div>
      </PremiumReveal>
    </PremiumCard>
  );
}