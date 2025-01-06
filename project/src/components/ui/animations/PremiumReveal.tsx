import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface PremiumRevealProps {
  children: ReactNode;
  className?: string;
}

export function PremiumReveal({ children, className = '' }: PremiumRevealProps) {
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        ease: "easeOut"
      }
    }
  };

  const itemVariants: Variants = prefersReduced 
    ? {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.6, ease: "easeOut" }
        }
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        }
      };

  return (
    <motion.div
      className={`relative ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 3
        }}
      />
    </motion.div>
  );
}