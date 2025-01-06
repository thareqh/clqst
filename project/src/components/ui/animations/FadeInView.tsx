import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { createFadeVariants } from './variants/fadeVariants';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInView({ children, delay = 0, className = '' }: FadeInViewProps) {
  const prefersReduced = useReducedMotion();
  const variants = createFadeVariants(prefersReduced, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}