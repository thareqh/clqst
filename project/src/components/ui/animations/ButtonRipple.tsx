import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface ButtonRippleProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ButtonRipple({ children, onClick, className = '' }: ButtonRippleProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      whileHover={prefersReduced ? {} : { scale: 1.02 }}
      whileTap={prefersReduced ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}