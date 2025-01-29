import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from './Logo';
import { NavLink } from './navigation/NavLink';
import { AuthButton } from './ui/AuthButton';
import { MobileMenu } from './navigation/MobileMenu';
import { useAuth } from '../contexts/AuthContext';
import { ProfileMenu } from './profile/ProfileMenu';
import { Users, Briefcase, EnvelopeSimple } from "@phosphor-icons/react";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser } = useAuth();
  const { scrollY } = useScroll();
  
  const headerBackground = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.95)']
  );
  
  const headerHeight = useTransform(
    scrollY,
    [0, 50],
    ['5rem', '4rem']
  );
  
  const borderOpacity = useTransform(
    scrollY,
    [0, 50],
    ['0.05', '0.1']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      style={{ 
        background: headerBackground,
        height: headerHeight,
        borderColor: useTransform(borderOpacity, opacity => `rgba(0, 0, 0, ${opacity})`)
      }}
      className="fixed w-full z-[100] border-b will-change-transform backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Logo />
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            <motion.div 
              className="flex items-center gap-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <NavLink href="/about">
                <motion.span
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  <Users className="w-4 h-4" weight="duotone" />
                  About
                </motion.span>
              </NavLink>
              <NavLink href="/partnership">
                <motion.span
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" weight="duotone" />
                  Partnership
                </motion.span>
              </NavLink>
              <NavLink href="/contact">
                <motion.span
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  <EnvelopeSimple className="w-4 h-4" weight="duotone" />
                  Contact
                </motion.span>
              </NavLink>
            </motion.div>
          </nav>

          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="hidden md:block">
              {currentUser ? (
                <ProfileMenu />
              ) : (
                <AuthButton />
              )}
            </div>
            <motion.button
              className="md:hidden p-2 hover:bg-gray-50 rounded-full transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </motion.header>
  );
}