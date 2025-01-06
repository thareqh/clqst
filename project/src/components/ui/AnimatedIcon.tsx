import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedIcon({ children, className = '' }: AnimatedIconProps) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ 
        scale: 1.2,
        rotate: 360,
        transition: { duration: 0.5, type: "spring" }
      }}
      whileTap={{ scale: 0.9 }}
    >
      {children}
    </motion.div>
  );
}