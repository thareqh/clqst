import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  delay?: number;
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  className = '', 
  delay = 0 
}: SlideInProps) {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
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