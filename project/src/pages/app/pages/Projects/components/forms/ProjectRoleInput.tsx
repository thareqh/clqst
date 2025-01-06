import { useState } from 'react';
import { Button } from '../../../../../../components/ui/Button';
import { SearchableMultiSelect } from '../../../../../../components/auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '../../../../../../components/auth/registration/data/skills';
import type { ProjectRole } from '../../../../../../types/project';

interface ProjectRoleInputProps {
  roles: ProjectRole[];
  onChange: (roles: ProjectRole[]) => void;
}

export function ProjectRoleInput({ roles, onChange }: ProjectRoleInputProps) {
  const [newRole, setNewRole] = useState<ProjectRole>({
    title: '',
    description: '',
    skills: [],
    isRequired: true
  });

  const addRole = () => {
    if (newRole.title && newRole.description) {
      onChange([...roles, newRole]);
      setNewRole({
        title: '',
        description: '',
        skills: [],
        isRequired: true
      });
    }
  };

  const removeRole = (index: number) => {
    onChange(roles.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        Required Roles
      </label>

      <div className="space-y-4 mb-4">
        {roles.map((role, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <div className="font-medium">{role.title}</div>
              <div className="text-sm text-gray-600 mb-2">{role.description}</div>
              <div className="flex flex-wrap gap-2">
                {role.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRole(index)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div>
          <input
            type="text"
            value={newRole.title}
            onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
            placeholder="Role title (e.g. Frontend Developer)"
            className="w-full px-4 py-2 rounded-xl border"
          />
        </div>

        <div>
          <textarea
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            placeholder="Role description and responsibilities"
            className="w-full px-4 py-2 rounded-xl border"
            rows={2}
          />
        </div>

        <SearchableMultiSelect
          label="Required Skills"
          options={SKILLS}
          value={newRole.skills}
          onChange={(skills) => setNewRole({ ...newRole, skills })}
          placeholder="Select required skills"
        />

        <Button
          type="button"
          onClick={addRole}
          disabled={!newRole.title || !newRole.description}
          className="w-full"
        >
          Add Role
        </Button>
      </div>
    </div>
  );
}