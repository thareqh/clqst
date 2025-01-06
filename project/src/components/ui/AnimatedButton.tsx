import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function AnimatedButton({ children, onClick, className = '', variant = 'primary' }: AnimatedButtonProps) {
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-gray-200 text-gray-900 hover:border-gray-300'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-medium ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 500,
        damping: 30
      }}
    >
      {children}
    </motion.button>
  );
}