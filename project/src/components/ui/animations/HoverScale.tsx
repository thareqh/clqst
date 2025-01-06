import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={prefersReduced ? {} : { scale }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}