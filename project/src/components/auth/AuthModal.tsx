import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export function AuthModal({ isOpen, onClose, redirectPath }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    onClose();
    if (redirectPath) {
      window.location.href = redirectPath;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md mx-4"
          >
            <h2 className="text-2xl font-medium mb-6">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            {isLogin ? (
              <LoginForm onSuccess={handleSuccess} />
            ) : (
              <SignupForm onSuccess={handleSuccess} />
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}