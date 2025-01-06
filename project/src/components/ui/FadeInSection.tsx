import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

export function FadeInSection({ 
  children, 
  className = '', 
  direction = 'up',
  delay = 0 
}: FadeInSectionProps) {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 50
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}