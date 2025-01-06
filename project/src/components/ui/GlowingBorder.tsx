import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingBorderProps {
  children: ReactNode;
  className?: string;
}

export function GlowingBorder({ children, className = '' }: GlowingBorderProps) {
  return (
    <motion.div
      className={`relative rounded-3xl ${className}`}
      whileHover={{
        boxShadow: "0 0 20px rgba(0,0,0,0.1), 0 0 40px rgba(0,0,0,0.05)",
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative bg-white rounded-3xl">{children}</div>
    </motion.div>
  );
}