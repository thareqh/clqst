import { useState, useEffect } from 'react';
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
  const [shouldValidate, setShouldValidate] = useState(false);
  const navigate = useNavigate();

  // Validasi hanya jika shouldValidate true atau ada perubahan setelah validasi pertama
  useEffect(() => {
    if (shouldValidate) {
      const validationErrors = validateCurrentStep(currentStep, formData);
      setErrors(validationErrors);
    }
  }, [formData, currentStep, shouldValidate]);

  const handleNext = async () => {
    setShouldValidate(true);
    const validationErrors = validateCurrentStep(currentStep, formData);
    
    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
        setErrors({});
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

  const handleBack = () => {
    setErrors({});
    setCurrentStep(prev => prev - 1);
  };

  const handleUpdateFields = (fields: Partial<RegistrationData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const isCurrentStepValid = shouldValidate ? Object.keys(errors).length === 0 : true;

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
            updateFields: handleUpdateFields,
            errors: shouldValidate ? errors : {}
          })}
        </motion.div>
      </AnimatePresence>

      <WizardNavigation
        currentStep={currentStep}
        onNext={handleNext}
        onBack={handleBack}
        isLoading={isLoading}
        isValid={isCurrentStepValid}
      />
    </div>
  );
}