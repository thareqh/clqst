import { motion } from 'framer-motion';

interface EmojiIconProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function EmojiIcon({ emoji, size = 'md', className = '' }: EmojiIconProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <motion.div 
      className={`${sizes[size]} ${className}`}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      {emoji}
    </motion.div>
  );
}