import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { FormInput } from './FormInput';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await login(email, password);
      onSuccess?.();
      // Navigate to app dashboard instead of profile
      navigate('/app');
      // Force a full page reload to ensure proper app initialization
      window.location.href = '/app';
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        type="email"
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />
      <FormInput
        type="password"
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
      />
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full justify-center mt-6"
        loading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
}