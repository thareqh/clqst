import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileMenuDropdownProps {
  currentUser: User | null;
  onClose: () => void;
}

export function ProfileMenuDropdown({ currentUser, onClose }: ProfileMenuDropdownProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="font-medium truncate">{currentUser?.displayName}</div>
        <div className="text-sm text-gray-500 truncate">{currentUser?.email}</div>
      </div>
      
      <div className="p-2">
        <Link
          to="/app/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
          onClick={onClose}
        >
          Profile Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}