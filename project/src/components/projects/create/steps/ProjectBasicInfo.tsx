import { FormInput } from '../../../ui/FormInput';
import { SearchableMultiSelect } from '../../../auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '../../../auth/registration/data/skills';

const CATEGORIES = [
  { id: 'web', name: 'Web Development', icon: '🌐' },
  { id: 'mobile', name: 'Mobile Development', icon: '📱' },
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'writing', name: 'Writing', icon: '✍️' },
  { id: 'video', name: 'Video Production', icon: '🎥' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'other', name: 'Other', icon: '💡' }
];

interface ProjectBasicInfoProps {
  data: {
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    tags: string[];
    skills: string[];
  };
  onChange: (data: Partial<ProjectBasicInfoProps['data']>) => void;
}

export function ProjectBasicInfo({ data, onChange }: ProjectBasicInfoProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium">Basic Information</h2>

      <FormInput
        type="text"
        label="Project Title"
        value={data.title}
        onChange={value => onChange({ title: value })}
        placeholder="Enter a clear, descriptive title"
        required
      />

      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Project Category
        </label>
        <select
          value={data.category}
          onChange={e => onChange({ category: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <FormInput
        type="text"
        label="Short Description"
        value={data.shortDescription}
        onChange={value => onChange({ shortDescription: value })}
        placeholder="Brief overview of your project (max 160 characters)"
        required
      />

      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Full Description
        </label>
        <textarea
          value={data.description}
          onChange={e => onChange({ description: e.target.value })}
          className="w-full px-4 py-2 rounded-xl border"
          rows={4}
          placeholder="Detailed description of your project"
          required
        />
      </div>

      <SearchableMultiSelect
        label="Required Skills"
        options={SKILLS}
        value={data.skills}
        onChange={skills => onChange({ skills })}
        placeholder="Select required skills"
      />
    </div>
  );
}