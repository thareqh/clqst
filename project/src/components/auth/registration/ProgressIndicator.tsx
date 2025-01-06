import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="relative">
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          
          return (
            <motion.div
              key={stepNumber}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {stepNumber}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Step {stepNumber}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="absolute top-4 left-0 right-0 h-px bg-gray-200 -z-10" />
      <motion.div
        className="absolute top-4 left-0 h-px bg-black"
        initial={{ width: '0%' }}
        animate={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}