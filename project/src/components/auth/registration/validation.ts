import { RegistrationData } from '../../../types/auth';

export function validateEmail(email: string): { message: string } | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { message: 'Please enter a valid email address' };
  }
  return null;
}

export function validatePassword(password: string): { message: string } | null {
  if (!password) {
    return { message: 'Password is required' };
  }

  if (password.length < 8) {
    return { message: 'Password must be at least 8 characters long' };
  }
  
  const requirements = [
    { regex: /[A-Z]/, message: 'one uppercase letter' },
    { regex: /[a-z]/, message: 'one lowercase letter' },
    { regex: /[0-9]/, message: 'one number' },
    { regex: /[!@#$%^&*]/, message: 'one special character (!@#$%^&*)' }
  ];

  const missing = requirements.filter(req => !req.regex.test(password));
  
  if (missing.length > 0) {
    const missingReqs = missing.map(m => m.message).join(', ');
    return { message: `Password must contain at least ${missingReqs}` };
  }
  
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): { message: string } | null {
  if (!confirm) {
    return { message: 'Please confirm your password' };
  }
  
  if (password !== confirm) {
    return { message: 'Passwords do not match' };
  }
  return null;
}

export function validateCurrentStep(step: number, data: RegistrationData): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1: // Basic Info
      // Email validation
      if (!data.email) {
        errors.email = 'Email is required';
      } else {
        const emailError = validateEmail(data.email);
        if (emailError) errors.email = emailError.message;
      }

      // Full name validation
      if (!data.fullName?.trim()) {
        errors.fullName = 'Full name is required';
      }

      // Password validation
      const passwordError = validatePassword(data.password);
      if (passwordError) {
        errors.password = passwordError.message;
      }

      // Confirm password validation
      if (data.password) {
        const confirmError = validatePasswordConfirm(data.password, data.passwordConfirm);
        if (confirmError) {
          errors.passwordConfirm = confirmError.message;
        }
      }
      break;

    case 2: // Profile
      if (!data.professionalTitle?.trim()) {
        errors.professionalTitle = 'Professional title is required';
      }
      if (!data.skills?.length) {
        errors.skills = 'Please select at least one skill';
      }
      if (!data.experienceLevel) {
        errors.experienceLevel = 'Experience level is required';
      }
      break;

    case 3: // Preferences
      if (!data.projectPreferences?.length) {
        errors.projectPreferences = 'Please select at least one project type';
      }
      if (!data.collaborationStyles?.length) {
        errors.collaborationStyles = 'Please select at least one collaboration style';
      }
      if (!data.languages?.length) {
        errors.languages = 'Please select at least one language';
      }
      if (!data.country) {
        errors.country = 'Please select your country';
      }
      if (!data.weeklyAvailability || data.weeklyAvailability < 1) {
        errors.weeklyAvailability = 'Please enter valid weekly availability';
      }
      break;

    case 4: // Review
      // No validation needed for review step
      break;
  }

  return errors;
}