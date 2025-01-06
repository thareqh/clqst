import { motion } from 'framer-motion';
import { CountryFlag } from '../../../ui/CountryFlag';
import { COUNTRIES } from '../data/countries';

interface CountryDisplayProps {
  country?: string;
}

export function CountryDisplay({ country }: CountryDisplayProps) {
  if (!country) return null;

  // Find country code from the country name
  const countryData = COUNTRIES.find(c => c.name === country);
  const countryCode = countryData?.code || '';

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {countryCode && <CountryFlag countryCode={countryCode} />}
      <span>{country}</span>
    </motion.div>
  );
}