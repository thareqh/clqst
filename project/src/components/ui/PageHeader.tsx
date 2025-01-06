import { motion } from 'framer-motion';
import { GradientText } from './GradientText';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  gradient?: boolean;
}

export function PageHeader({ title, subtitle, gradient = false }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mb-16"
    >
      <h1 className="text-5xl font-normal mb-6">
        {gradient ? (
          <>
            <GradientText direction="br">{title.split(' ')[0]}</GradientText>{' '}
            {title.split(' ').slice(1).join(' ')}
          </>
        ) : (
          title
        )}
      </h1>
      <p className="text-xl font-light text-gray-600">{subtitle}</p>
    </motion.div>
  );
}