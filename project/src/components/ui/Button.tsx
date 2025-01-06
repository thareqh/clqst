import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { LoadingSpinner } from './animations/LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  href, 
  className = '',
  onClick,
  loading = false,
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const prefersReduced = useReducedMotion();
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-900 active:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border-2 border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  const motionProps = prefersReduced ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  };

  const content = (
    <>
      {loading && (
        <div className="mr-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.div {...motionProps}>
        <Link
          to={href}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...motionProps}
      disabled={disabled || loading}
    >
      {content}
    </motion.button>
  );
}