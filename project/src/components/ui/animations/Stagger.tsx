import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function Stagger({ children, className = '', staggerDelay = 0.1 }: StaggerProps) {
  return (
    <motion.div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}