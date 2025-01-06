import { useState } from 'react';
import { motion } from 'framer-motion';

interface BioInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function BioInput({ value, onChange, maxLength = 500 }: BioInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value.length;
  const charRemaining = maxLength - charCount;

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        Bio
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          rows={4}
          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-0 transition-colors resize-none"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFocused || charCount > 0 ? 1 : 0 }}
          className="absolute bottom-2 right-3 text-xs text-gray-400"
        >
          {charRemaining} characters remaining
        </motion.div>
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        Add a brief bio to help others understand your background and interests.
      </div>
    </div>
  );
}