import { motion } from 'framer-motion';

interface GradientBlobProps {
  className?: string;
}

export function GradientBlob({ className = '' }: GradientBlobProps) {
  return (
    <motion.div
      className={`${className} blur-[100px]`}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.3, 0.2],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" />
    </motion.div>
  );
}