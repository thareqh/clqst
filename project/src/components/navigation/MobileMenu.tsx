import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Logo } from '../Logo';
import { 
  Users, 
  Handshake, 
  EnvelopeSimple, 
  ArrowRight,
  X,
  SignIn,
  UserPlus
} from '@phosphor-icons/react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuVariants = {
  closed: {
    opacity: 0,
    y: "-100%",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const backdropVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.3
    }
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

const menuItemVariants = {
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  })
};

const menuItems = [
  { 
    to: '/about', 
    label: 'About',
    icon: Users,
    description: 'Learn about our mission and team'
  },
  { 
    to: '/partnership', 
    label: 'Partnership',
    icon: Handshake,
    description: 'Collaborate and grow with us'
  },
  { 
    to: '/contact', 
    label: 'Contact',
    icon: EnvelopeSimple,
    description: 'Get in touch with our team'
  }
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Base Blur Layer */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 backdrop-blur-[40px] z-[98]"
          />

          {/* Tint Layer */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-white/50 z-[99]"
          />

          {/* Menu Content */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 right-0 h-screen z-[100] bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-3xl"
          >
            <div className="relative backdrop-blur-lg bg-white/20">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Logo />
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      href="/signin"
                      className="text-sm font-medium px-4 py-2 bg-white/20 hover:bg-white/30"
                      onClick={onClose}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="primary"
                      href="/signup"
                      className="text-sm font-medium px-4 py-2"
                      onClick={onClose}
                    >
                      Sign Up
                    </Button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors ml-2"
                    >
                      <X weight="bold" className="w-6 h-6 text-zinc-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="px-4 py-6">
                  <div className="space-y-2.5">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.to}
                        custom={index}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className="group block p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <item.icon weight="duotone" className="w-5 h-5 text-zinc-700" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-medium text-zinc-900">{item.label}</span>
                                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform duration-300" />
                              </div>
                              <p className="text-sm text-zinc-500 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}