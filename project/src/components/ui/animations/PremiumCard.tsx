import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
}

export function PremiumCard({ children, className = '' }: PremiumCardProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={`relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={prefersReduced ? {} : {
        y: -8,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}