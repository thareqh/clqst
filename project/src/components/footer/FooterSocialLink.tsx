import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface FooterSocialLinkProps {
  href: string;
  icon: IconType;
  label: string;
}

export function FooterSocialLink({ href, icon: Icon, label }: FooterSocialLinkProps) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <Icon className="w-5 h-5" />
    </motion.a>
  );
}