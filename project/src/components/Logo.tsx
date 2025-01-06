import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
    >
      <Link 
        to="/" 
        className="flex items-center gap-2"
      >
        <img 
          src="/logo.svg" 
          alt="Cliquest Logo" 
          className="w-8 h-8"
        />
        <span className="text-lg font-medium text-gray-900">Cliquest</span>
      </Link>
    </motion.div>
  );
}