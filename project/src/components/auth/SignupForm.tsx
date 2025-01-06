import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationWizard } from './registration/RegistrationWizard';
import { useAuth } from '../../contexts/AuthContext';
import type { RegistrationData } from '../../types/auth';

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async (data: RegistrationData) => {
    try {
      await signup(data.email, data.password, data);
      onSuccess?.();
      // Navigate to app dashboard instead of profile
      navigate('/app');
      // Force a full page reload to ensure proper app initialization
      window.location.href = '/app';
    } catch (err: any) {
      const message = err.message || 'Failed to create account. Please try again.';
      setError(message);
      throw new Error(message);
    }
  };

  return (
    <div>
      <RegistrationWizard onComplete={handleComplete} />
      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}