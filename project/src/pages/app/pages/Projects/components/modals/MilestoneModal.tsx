import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Project, ProjectMilestone } from '@/types/project';

interface MilestoneModalProps {
  project: Project;
  milestone?: ProjectMilestone;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type FormData = {
  title: string;
  description: string;
  dueDate: string;
};

export function MilestoneModal({ project, milestone, isOpen, onClose, onUpdate }: MilestoneModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: milestone?.title || '',
    description: milestone?.description || '',
    dueDate: milestone?.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id) return;

    try {
      setIsLoading(true);

      const projectRef = doc(db, 'projects', project.id);
      const newMilestone = {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      let updatedMilestones;
      if (milestone) {
        // Edit existing milestone
        updatedMilestones = project.milestones.map(m => 
          m.title === milestone.title ? newMilestone : m
        );
      } else {
        // Add new milestone
        updatedMilestones = [...(project.milestones || []), newMilestone];
      }

      await updateDoc(projectRef, {
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString()
      });
      
      onUpdate({
        ...project,
        milestones: updatedMilestones
      });
      toast.success(milestone ? 'Milestone updated successfully' : 'Milestone added successfully');
      onClose();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error(milestone ? 'Failed to update milestone' : 'Failed to add milestone');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {milestone ? 'Edit Milestone' : 'Add New Milestone'}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Milestone Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Milestone Description */}
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

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : milestone ? 'Save Changes' : 'Add Milestone'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 