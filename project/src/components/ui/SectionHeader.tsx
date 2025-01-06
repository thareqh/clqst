import { motion } from 'framer-motion';
import { GradientText } from './GradientText';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-12">
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="text-2xl font-normal"
      >
        <GradientText>{title}</GradientText>
      </motion.h2>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="text-sm text-gray-600"
      >
        {subtitle}
      </motion.div>
    </div>
  );
}