import { useState } from 'react';
import { FormInput } from '../../FormInput';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function EmailInput({ value, onChange, error }: EmailInputProps) {
  const [isChecking, setIsChecking] = useState(false);

  const checkEmailAvailability = async () => {
    setIsChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsChecking(false);
    return true;
  };

  const handleChange = async (newValue: string) => {
    onChange(newValue);
    if (newValue && newValue.includes('@')) {
      await checkEmailAvailability();
    }
  };

  return (
    <div className="relative">
      <FormInput
        type="email"
        label="Email Address"
        value={value}
        onChange={handleChange}
        placeholder="you@example.com"
        required
      />
      
      {isChecking && (
        <div className="absolute right-4 top-[38px] text-gray-400">
          Checking...
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}