import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Typewriter({ text, className = '', speed = 0.05 }: TypewriterProps) {
  const controls = useAnimationControls();
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={controls}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        |
      </motion.span>
    </motion.span>
  );
}