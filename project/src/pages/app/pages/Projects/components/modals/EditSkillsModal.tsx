import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Project } from '@/types/project';
import { SearchableMultiSelect } from '@/components/auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '@/components/auth/registration/data/skills';

interface EditSkillsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

export function EditSkillsModal({ project, isOpen, onClose, onUpdate }: EditSkillsModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(project.skills || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id) return;

    try {
      setIsLoading(true);

      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        skills: selectedSkills,
        updatedAt: new Date().toISOString()
      });
      
      onUpdate({
        ...project,
        skills: selectedSkills
      });
      toast.success('Skills updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating skills:', error);
      toast.error('Failed to update skills');
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
            <h2 className="text-lg font-semibold text-gray-900">Edit Project Skills</h2>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                Select the skills that are required for this project. These skills will help potential contributors understand what expertise is needed.
              </p>

              <SearchableMultiSelect
                label="Project Skills"
                options={SKILLS}
                value={selectedSkills}
                onChange={setSelectedSkills}
                placeholder="Select project skills"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedSkills.length} skills selected
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
} 