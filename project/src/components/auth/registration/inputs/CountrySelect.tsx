import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES } from '../data/countries';
import { CountryFlag } from '../../../ui/CountryFlag';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
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

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  return (
    <div ref={ref}>
      <label className="block text-sm text-gray-600 mb-2">
        Country
      </label>
      <div className="relative">
        <motion.div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {selectedCountry ? (
            <>
              <CountryFlag countryCode={selectedCountry.code} size="md" />
              <span className="text-gray-900">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Select your country</span>
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
                    placeholder="Search countries..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-gray-300 focus:ring-0"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
              </div>

              <div className="max-h-[300px] overflow-auto">
                {filteredCountries.map(country => (
                  <motion.div
                    key={country.code}
                    onClick={() => {
                      onChange(country.name);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <CountryFlag countryCode={country.code} size="md" />
                    <span className="flex-1">{country.name}</span>
                    <span className="text-sm text-gray-400">{country.code}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}