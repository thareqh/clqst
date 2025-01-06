import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
  className?: string;
}

export function Highlight({ children, className = '' }: HighlightProps) {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <motion.span
        className="absolute inset-0 bg-gray-100 rounded-lg -z-10"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      {children}
    </motion.span>
  );
}