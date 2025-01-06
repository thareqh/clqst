import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeScaleProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeScale({ children, className = '', delay = 0 }: FadeScaleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}