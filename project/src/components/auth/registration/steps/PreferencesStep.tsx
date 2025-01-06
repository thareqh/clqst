import { FormInput } from '../../FormInput';
import { RegistrationData } from '../../../../types/auth';
import { SearchableMultiSelect } from '../inputs/SearchableMultiSelect';
import { CountrySelect } from '../inputs/CountrySelect';
import { PROJECT_TYPES } from '../data/projectTypes';

const COLLABORATION_STYLES = [
  'Remote', 'Hybrid', 'On-site'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese',
  'Japanese', 'Korean', 'Portuguese', 'Russian', 'Arabic',
  'Hindi', 'Bengali', 'Vietnamese', 'Thai', 'Indonesian',
  'Turkish', 'Italian', 'Dutch', 'Polish', 'Swedish',
  'Danish', 'Norwegian', 'Finnish', 'Greek', 'Hebrew'
];

interface PreferencesStepProps {
  data: RegistrationData;
  updateFields: (fields: Partial<RegistrationData>) => void;
}

export function PreferencesStep({ data, updateFields }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <SearchableMultiSelect
        label="Project Type Preferences"
        options={PROJECT_TYPES}
        value={data.projectPreferences || []}
        onChange={(value) => updateFields({ projectPreferences: value })}
        placeholder="Select project types"
        searchPlaceholder="Search project types..."
      />

      <SearchableMultiSelect
        label="Preferred Collaboration Styles"
        options={COLLABORATION_STYLES}
        value={data.collaborationStyles || []}
        onChange={(value) => updateFields({ collaborationStyles: value })}
        placeholder="Select collaboration styles"
      />

      <SearchableMultiSelect
        label="Language Preferences"
        options={LANGUAGES}
        value={data.languages || []}
        onChange={(value) => updateFields({ languages: value })}
        placeholder="Select languages"
        searchPlaceholder="Search languages..."
      />

      <CountrySelect
        value={data.country || ''}
        onChange={(value) => updateFields({ country: value })}
      />

      <FormInput
        type="number"
        label="Weekly Availability (hours)"
        value={data.weeklyAvailability?.toString() || ''}
        onChange={(value) => updateFields({ weeklyAvailability: parseInt(value) || 0 })}
        placeholder="Enter hours per week"
        min="0"
        max="168"
      />
    </div>
  );
}