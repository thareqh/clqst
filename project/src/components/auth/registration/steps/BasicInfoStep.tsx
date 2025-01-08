import { StepProps } from '../types';
import { FormInput } from '../../FormInput';
import { PasswordInput } from '../inputs/PasswordInput';
import { EmailInput } from '../inputs/EmailInput';

interface BasicInfoStepProps extends StepProps {
  errors?: Record<string, string>;
}

export function BasicInfoStep({ data, updateFields, errors = {} }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <EmailInput
        value={data.email}
        onChange={(value) => updateFields({ email: value })}
        error={errors.email}
      />

      <FormInput
        type="text"
        label="Full Name"
        value={data.fullName}
        onChange={(value) => updateFields({ fullName: value })}
        placeholder="John Doe"
        required
        error={errors.fullName}
      />

      <PasswordInput
        value={data.password}
        onChange={(value) => updateFields({ password: value })}
        error={errors.password}
      />

      <FormInput
        type="password"
        label="Confirm Password"
        value={data.passwordConfirm}
        onChange={(value) => updateFields({ passwordConfirm: value })}
        placeholder="••••••••"
        required
        error={errors.passwordConfirm}
      />
    </div>
  );
}