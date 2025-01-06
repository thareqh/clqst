import { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { NavLink } from './navigation/NavLink';
import { AuthButton } from './ui/AuthButton';
import { MobileMenu } from './navigation/MobileMenu';
import { useAuth } from '../contexts/AuthContext';
import { ProfileMenu } from './profile/ProfileMenu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-[100] border-b border-gray-100 will-change-transform ${
      isScrolled 
        ? 'h-16 bg-white/95 backdrop-blur-sm shadow-sm' 
        : 'h-16 md:h-20 bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/about">👥 About</NavLink>
            <NavLink href="/careers">💼 Careers</NavLink>
            <NavLink href="/contact">✉️ Contact</NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {currentUser ? (
                <ProfileMenu />
              ) : (
                <AuthButton />
              )}
            </div>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors relative z-50"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}