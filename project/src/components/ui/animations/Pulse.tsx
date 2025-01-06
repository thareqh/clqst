import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PulseProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function Pulse({ children, className = '', scale = 1.05 }: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}