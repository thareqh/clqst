import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ShimmerButton({ children, className = '', onClick }: ShimmerButtonProps) {
  return (
    <motion.button
      className={`relative px-6 py-3 rounded-full overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}