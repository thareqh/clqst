import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { GradientText } from '../ui/GradientText';
import { PremiumCard } from '../ui/animations/PremiumCard';
import { PremiumReveal } from '../ui/animations/PremiumReveal';

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <PremiumCard className="p-8">
      <PremiumReveal>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-medium mb-8 text-center">
            <GradientText>{title}</GradientText>
          </h1>
          {children}
        </motion.div>
      </PremiumReveal>
    </PremiumCard>
  );
}