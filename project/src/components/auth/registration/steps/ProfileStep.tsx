import { FormInput } from '../../FormInput';
import { RegistrationData } from '../../../../types/auth';
import { Select } from '../inputs/Select';
import { SearchableMultiSelect } from '../inputs/SearchableMultiSelect';
import { ProfilePictureEditor } from '../inputs/ProfilePictureEditor';
import { BioInput } from '../inputs/BioInput';
import { SKILLS } from '../data/skills';

const EXPERIENCE_LEVELS = [
  '0-2 years', '2-5 years', '5-10 years', '10+ years'
];

interface ProfileStepProps {
  data: RegistrationData;
  updateFields: (fields: Partial<RegistrationData>) => void;
}

export function ProfileStep({ data, updateFields }: ProfileStepProps) {
  return (
    <div className="space-y-6">
      <ProfilePictureEditor
        name={data.fullName}
        image={data.profileImage}
        emoji={data.profileEmoji}
        backgroundColor={data.profileColor}
        onUpdate={(fields) => updateFields(fields)}
      />

      <FormInput
        type="text"
        label="Professional Title"
        value={data.professionalTitle || ''}
        onChange={(value) => updateFields({ professionalTitle: value })}
        placeholder="e.g. Senior Frontend Developer"
        required
      />

      <BioInput
        value={data.bio || ''}
        onChange={(value) => updateFields({ bio: value })}
      />

      <SearchableMultiSelect
        label="Skills"
        options={SKILLS}
        value={data.skills || []}
        onChange={(value) => updateFields({ skills: value })}
        placeholder="Select your skills"
        searchPlaceholder="Search skills..."
      />

      <Select
        label="Experience Level"
        options={EXPERIENCE_LEVELS}
        value={data.experienceLevel || ''}
        onChange={(value) => updateFields({ experienceLevel: value })}
        placeholder="Select your experience level"
      />

      <FormInput
        type="number"
        label="Years of Experience"
        value={data.yearsOfExperience?.toString() || ''}
        onChange={(value) => updateFields({ yearsOfExperience: parseInt(value) || 0 })}
        placeholder="Enter number of years"
        required
      />
    </div>
  );
}