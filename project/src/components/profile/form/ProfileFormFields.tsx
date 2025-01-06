import { FormInput } from '../../auth/FormInput';
import { SearchableMultiSelect } from '../../auth/registration/inputs/SearchableMultiSelect';
import { CountrySelect } from '../../auth/registration/inputs/CountrySelect';
import { BioInput } from '../../auth/registration/inputs/BioInput';
import { SKILLS } from '../../auth/registration/data/skills';
import { PROJECT_TYPES } from '../../auth/registration/data/projectTypes';
import { LANGUAGES } from '../../auth/registration/data/languages';
import type { ProfileFormData } from './types';

interface ProfileFormFieldsProps {
  formData: ProfileFormData;
  onChange: (data: ProfileFormData) => void;
}

export function ProfileFormFields({ formData, onChange }: ProfileFormFieldsProps) {
  const updateField = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <>
      <FormInput
        type="text"
        label="Full Name"
        value={formData.fullName}
        onChange={(value) => updateField('fullName', value)}
        placeholder="Your full name"
      />

      <FormInput
        type="text"
        label="Professional Title"
        value={formData.professionalTitle}
        onChange={(value) => updateField('professionalTitle', value)}
        placeholder="e.g. Senior Frontend Developer"
      />

      <BioInput
        value={formData.bio}
        onChange={(value) => updateField('bio', value)}
      />

      <SearchableMultiSelect
        label="Skills"
        options={SKILLS}
        value={formData.skills}
        onChange={(value) => updateField('skills', value)}
        placeholder="Select your skills"
      />

      <SearchableMultiSelect
        label="Project Preferences"
        options={PROJECT_TYPES}
        value={formData.projectPreferences}
        onChange={(value) => updateField('projectPreferences', value)}
        placeholder="Select project types"
      />

      <SearchableMultiSelect
        label="Languages"
        options={LANGUAGES}
        value={formData.languages}
        onChange={(value) => updateField('languages', value)}
        placeholder="Select languages"
      />

      <CountrySelect
        value={formData.country}
        onChange={(value) => updateField('country', value)}
      />

      <FormInput
        type="number"
        label="Weekly Availability (hours)"
        value={formData.weeklyAvailability.toString()}
        onChange={(value) => updateField('weeklyAvailability', parseInt(value) || 0)}
        min="0"
        max="168"
      />
    </>
  );
}