import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className = '' }: HoverCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 ${className}`}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
    >
      {children}
    </motion.div>
  );
}