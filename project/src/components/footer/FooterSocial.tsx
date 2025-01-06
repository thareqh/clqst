import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import { motion } from 'framer-motion';

const socialLinks = [
  { icon: FaTwitter, href: 'https://twitter.com/cliquest', label: 'Twitter' },
  { icon: FaGithub, href: 'https://github.com/cliquest', label: 'GitHub' },
  { icon: FaDiscord, href: 'https://discord.gg/cliquest', label: 'Discord' }
];

export function FooterSocial() {
  return (
    <div className="flex gap-6">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <motion.a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-5 h-5" aria-label={label} />
        </motion.a>
      ))}
    </div>
  );
}