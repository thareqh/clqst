import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { ProfilePicture } from './ProfilePicture';
import { ProfileMenuDropdown } from './ProfileMenuDropdown';

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        <ProfilePicture size="sm" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <ProfileMenuDropdown 
              currentUser={currentUser}
              onClose={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}