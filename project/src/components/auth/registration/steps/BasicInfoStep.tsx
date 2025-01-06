import { StepProps } from '../types';
import { FormInput } from '../../FormInput';
import { PasswordInput } from '../inputs/PasswordInput';
import { EmailInput } from '../inputs/EmailInput';

export function BasicInfoStep({ data, updateFields }: StepProps) {
  return (
    <div className="space-y-6">
      <EmailInput
        value={data.email}
        onChange={(value) => updateFields({ email: value })}
      />

      <FormInput
        type="text"
        label="Full Name"
        value={data.fullName}
        onChange={(value) => updateFields({ fullName: value })}
        placeholder="John Doe"
        required
      />

      <PasswordInput
        value={data.password}
        onChange={(value) => updateFields({ password: value })}
      />

      <FormInput
        type="password"
        label="Confirm Password"
        value={data.passwordConfirm}
        onChange={(value) => updateFields({ passwordConfirm: value })}
        placeholder="••••••••"
        required
      />
    </div>
  );
}