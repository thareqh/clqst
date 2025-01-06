import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressIndicator } from './ProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { validateCurrentStep } from './validation';
import { getCurrentStep } from './getCurrentStep';
import type { RegistrationData } from '../../../types/auth';

interface RegistrationWizardProps {
  onComplete?: (data: RegistrationData) => Promise<void>;
}

export function RegistrationWizard({ onComplete }: RegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    fullName: '',
    password: '',
    passwordConfirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleNext = async () => {
    const validationErrors = validateCurrentStep(currentStep, formData);
    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsLoading(true);
        try {
          await onComplete?.(formData);
          navigate('/profile');
        } catch (error: any) {
          setErrors({ submit: error.message || 'Failed to create account' });
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={4} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mt-8"
        >
          {getCurrentStep({ 
            step: currentStep, 
            data: formData, 
            updateFields: (fields) => setFormData(prev => ({ ...prev, ...fields }))
          })}
        </motion.div>
      </AnimatePresence>

      <WizardNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onBack={() => setCurrentStep(prev => prev - 1)}
        isLoading={isLoading}
        isValid={Object.keys(errors).length === 0}
      />
    </div>
  );
}