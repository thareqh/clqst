import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FormInput } from '../../FormInput';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface Requirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export function PasswordInput({ value, onChange, error }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([
    { label: 'At least 8 characters', regex: /.{8,}/, met: false },
    { label: 'One uppercase letter', regex: /[A-Z]/, met: false },
    { label: 'One lowercase letter', regex: /[a-z]/, met: false },
    { label: 'One number', regex: /[0-9]/, met: false },
    { label: 'One special character (!@#$%^&*)', regex: /[!@#$%^&*]/, met: false }
  ]);

  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.regex.test(value)
      }))
    );
  }, [value]);

  const strength = requirements.filter(req => req.met).length;

  return (
    <div>
      <div className="relative">
        <FormInput
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      {value && (
        <div className="mt-2">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-1 w-full rounded-full bg-gray-200"
                animate={{
                  backgroundColor: i < strength ? '#000' : '#e5e7eb'
                }}
              />
            ))}
          </div>
          
          <div className="space-y-1">
            {requirements.map((req, index) => (
              <motion.div
                key={req.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-xs"
              >
                <motion.span
                  animate={{
                    color: req.met ? '#16a34a' : '#ef4444'
                  }}
                >
                  {req.met ? '✓' : '×'}
                </motion.span>
                <span className={req.met ? 'text-green-600' : 'text-red-500'}>
                  {req.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}