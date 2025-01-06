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
    <motion.div
      whileHover={{ y: -1 }}
      className="relative"
    >
      <Link
        to={href}
        className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'} hover:text-gray-900 transition-colors ${className}`}
      >
        {children}
        <span className={`absolute inset-x-0 -bottom-1 h-0.5 bg-black transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </Link>
    </motion.div>
  );
}