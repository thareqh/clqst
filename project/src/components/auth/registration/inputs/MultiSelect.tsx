import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  return (
    <div ref={ref}>
      <label className="block text-sm text-gray-600 mb-2">
        {label}
      </label>
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-gray-400 cursor-pointer"
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map(item => (
                <span
                  key={item}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto"
            >
              {options.map(option => (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                    value.includes(option) ? 'bg-gray-50' : ''
                  }`}
                >
                  {option}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}