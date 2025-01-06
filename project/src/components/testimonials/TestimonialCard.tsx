import { motion } from 'framer-motion';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  emoji: string;
}

export function TestimonialCard({ quote, author, role, company, emoji }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
      <p className="text-sm sm:text-base text-gray-600 mb-6">"{quote}"</p>
      <div className="flex items-center gap-3 sm:gap-4">
        <motion.div 
          className="text-2xl sm:text-3xl"
          initial={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {emoji}
        </motion.div>
        <div>
          <div className="font-medium text-sm sm:text-base">{author}</div>
          <div className="text-xs sm:text-sm text-gray-600">{role} @ {company}</div>
        </div>
      </div>
    </div>
  );
}