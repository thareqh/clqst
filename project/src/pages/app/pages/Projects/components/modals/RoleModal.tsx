import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Project, ProjectRole } from '@/types/project';
import { SKILLS_LIST } from '@/constants/skills';
import { SearchableMultiSelect } from '@/components/auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '@/components/auth/registration/data/skills';

interface RoleModalProps {
  project: Project;
  role?: ProjectRole;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type FormData = {
  title: string;
  description: string;
  color: string;
  isRequired: boolean;
  skills: string[];
};

const COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#84CC16', // lime
  '#10B981', // emerald
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
];

export function RoleModal({ project, role, isOpen, onClose, onUpdate }: RoleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: role?.title || '',
    description: role?.description || '',
    color: role?.color || COLORS[0],
    isRequired: role?.isRequired || false,
    skills: role?.skills || [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id) return;

    try {
      setIsLoading(true);

      const projectRef = doc(db, 'projects', project.id);
      const newRole = {
        title: formData.title,
        description: formData.description,
        color: formData.color,
        isRequired: formData.isRequired,
        skills: formData.skills,
      };

      let updatedRoles;
      if (role) {
        // Edit existing role
        updatedRoles = project.requiredRoles.map(r => 
          r.title === role.title ? newRole : r
        );
      } else {
        // Add new role
        updatedRoles = [...(project.requiredRoles || []), newRole];
      }

      await updateDoc(projectRef, {
        requiredRoles: updatedRoles,
        updatedAt: new Date().toISOString()
      });
      
      onUpdate({
        ...project,
        requiredRoles: updatedRoles
      });
      toast.success(role ? 'Role updated successfully' : 'Role added successfully');
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(role ? 'Failed to update role' : 'Failed to add role');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {role ? 'Edit Role' : 'Add New Role'}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              {/* Role Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Role Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isRequired" className="text-sm text-gray-700">
                  This role is required for the project
                </label>
              </div>

              {/* Skills Selection */}
              <SearchableMultiSelect
                label="Required Skills"
                options={SKILLS}
                value={formData.skills}
                onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                placeholder="Select required skills"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : role ? 'Save Changes' : 'Add Role'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 