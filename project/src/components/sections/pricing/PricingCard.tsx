import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';
import { Check, Sparkle } from '@phosphor-icons/react';

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
  const buttonText = plan.price === 'Custom' ? 'Contact Sales' : 'Get Started';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative group"
    >
      {/* Animated Border */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
      
      <div className="relative p-8 bg-gradient-to-b from-white to-zinc-50/50 backdrop-blur-xl rounded-2xl transition-all duration-300 border border-zinc-200/50 group-hover:border-transparent shadow-lg shadow-zinc-100/50 h-full">
        {isPopular && (
          <>
            {/* Popular Plan Highlight Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-100/20 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Most Popular Badge - Moved after highlight effect and added z-index */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="px-4 py-1.5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-full flex items-center gap-1.5 shadow-lg">
                <Sparkle className="w-3.5 h-3.5 text-amber-400" weight="fill" />
                <span className="text-xs text-white font-medium">Most Popular</span>
              </div>
            </div>
          </>
        )}

        {/* Content Container - Added z-index to stay above highlight effect */}
        <div className="relative z-[1]">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-black transition-colors">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-3">
                {plan.price === 'Custom' ? (
                  <span className="text-4xl font-light text-zinc-900">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-light text-zinc-900">${plan.price}</span>
                    <span className="text-sm text-zinc-500">/month</span>
                  </>
                )}
              </div>
              <p className="text-sm text-zinc-600 group-hover:text-zinc-700 transition-colors">
                {plan.description}
              </p>
            </motion.div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {plan.features.map((feature, featureIndex) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.1 }}
                className="flex items-start gap-3 group/feature"
              >
                <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-white to-zinc-50 border border-zinc-100 shadow-sm flex items-center justify-center mt-0.5 group-hover/feature:border-zinc-200 group-hover/feature:shadow-md transition-all duration-300">
                  <Check className="w-3 h-3 text-zinc-600 group-hover/feature:text-zinc-800 transition-colors" weight="bold" />
                </div>
                <span className="text-sm text-zinc-600 group-hover/feature:text-zinc-700 transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="relative">
            <Button
              onClick={() => onSelect(plan.name)}
              variant={isPopular ? 'primary' : 'secondary'}
              className="w-full justify-center group-hover:scale-[1.02] transition-transform duration-300"
            >
              {buttonText}
            </Button>
          </div>
        </div>

        {/* Hover Effects */}
        <div className="absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-white to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>
      </div>
    </motion.div>
  );
}