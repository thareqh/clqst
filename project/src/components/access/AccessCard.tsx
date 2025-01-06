import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { AuthModal } from '../auth/AuthModal';

interface AccessCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  href: string;
  requiresAuth?: boolean;
}

export function AccessCard({ 
  title, 
  description, 
  icon, 
  buttonText, 
  href,
  requiresAuth = false 
}: AccessCardProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = () => {
    if (requiresAuth) {
      setIsAuthModalOpen(true);
    } else {
      window.location.href = href;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="text-4xl mb-6">{icon}</div>
        <h2 className="text-2xl font-medium mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{description}</p>
        <Button
          variant="primary"
          onClick={handleClick}
          className="w-full justify-center"
        >
          {buttonText}
        </Button>
      </motion.div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectPath={href}
      />
    </>
  );
}