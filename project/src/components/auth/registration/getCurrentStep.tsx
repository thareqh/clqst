import { ReactNode } from 'react';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ProfileStep } from './steps/ProfileStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { ReviewStep } from './steps/ReviewStep';
import type { GetCurrentStepProps } from './types';

export function getCurrentStep({ step, data, updateFields, errors }: GetCurrentStepProps): ReactNode {
  switch (step) {
    case 1:
      return <BasicInfoStep data={data} updateFields={updateFields} errors={errors} />;
    case 2:
      return <ProfileStep data={data} updateFields={updateFields} />;
    case 3:
      return <PreferencesStep data={data} updateFields={updateFields} />;
    case 4:
      return <ReviewStep data={data} />;
    default:
      return null;
  }
}