import { RegistrationData } from '../../../types/auth';

export interface StepProps {
  data: RegistrationData;
  updateFields: (fields: Partial<RegistrationData>) => void;
}

export interface GetCurrentStepProps {
  step: number;
  data: RegistrationData;
  updateFields: (fields: Partial<RegistrationData>) => void;
  errors?: Record<string, string>;
}