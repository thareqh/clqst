import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchableMultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function SearchableMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...'
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

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
        <motion.div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {value.map(item => (
                <span
                  key={item}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {item}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(item);
                    }}
                    className="ml-1.5 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200"
            >
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
              </div>

              <div className="max-h-[300px] overflow-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => (
                    <motion.div
                      key={option}
                      onClick={() => toggleOption(option)}
                      className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                      whileHover={{ x: 4 }}
                    >
                      <input
                        type="checkbox"
                        checked={value.includes(option)}
                        onChange={() => {}}
                        className="rounded border-gray-300"
                      />
                      <span>{option}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No matches found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}