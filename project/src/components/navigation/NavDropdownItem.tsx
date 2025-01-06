import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NavDropdownItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

export function NavDropdownItem({ icon, title, description, href, external }: NavDropdownItemProps) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : "_self"}
      className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg group transition-colors"
      whileHover={{ x: 4 }}
    >
      <span className="text-gray-600">{icon}</span>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {external ? (
        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" viewBox="0 0 16 16" fill="none">
          <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </motion.a>
  );
}