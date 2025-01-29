import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className = '' }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link to={href}>
      <motion.div
        className={`relative inline-block ${className}`}
        whileHover="hover"
        initial="initial"
        animate="animate"
      >
        <motion.div
          className={`relative z-10 py-2 px-4 text-sm transition-all duration-200 ${
            isActive 
              ? 'text-gray-900 font-semibold' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
          variants={{
            initial: { y: 0 },
            hover: { y: 0 }
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </Link>
  );
}