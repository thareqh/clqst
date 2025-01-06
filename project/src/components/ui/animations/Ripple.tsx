import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface RippleProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function Ripple({ children, className = '', color = 'rgba(0,0,0,0.1)' }: RippleProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples([...ripples, { x, y, id }]);
    setTimeout(() => {
      setRipples(ripples => ripples.filter(ripple => ripple.id !== id));
    }, 1000);
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {ripples.map(({ x, y, id }) => (
        <motion.div
          key={id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {children}
    </motion.div>
  );
}