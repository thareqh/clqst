import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Project } from '@/types/project';

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: Project) => void;
}

type FormData = {
  title: string;
  shortDescription: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'other';
  phase: 'idea' | 'prototype' | 'development' | 'growth' | 'maintenance';
  status: 'open' | 'closed' | 'completed';
  visibility: 'public' | 'private';
  websiteUrl: string;
  problemStatement: string;
  expectedOutcomes: string;
  targetAudience: string;
  projectGoals: string;
};

export function EditProjectModal({ project, isOpen, onClose, onUpdate }: EditProjectModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: project.title,
    shortDescription: project.shortDescription,
    description: project.description,
    category: project.category as FormData['category'],
    phase: project.phase as FormData['phase'],
    status: project.status as FormData['status'],
    visibility: project.visibility as FormData['visibility'],
    websiteUrl: project.websiteUrl || '',
    problemStatement: project.problemStatement,
    expectedOutcomes: project.expectedOutcomes,
    targetAudience: project.targetAudience,
    projectGoals: project.projectGoals?.join('\n') || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.id) return;

    try {
      setIsLoading(true);

      const projectRef = doc(db, 'projects', project.id);
      const updatedData = {
        ...formData,
        projectGoals: formData.projectGoals.split('\n').filter(goal => goal.trim()),
        updatedAt: new Date().toISOString()
      };

      await updateDoc(projectRef, updatedData);
      
      onUpdate({ 
        ...project, 
        ...updatedData,
        category: updatedData.category,
        phase: updatedData.phase,
        status: updatedData.status,
        visibility: updatedData.visibility
      });
      toast.success('Project updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Project Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Project Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      category: e.target.value as FormData['category']
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="desktop">Desktop Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phase
                  </label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      phase: e.target.value as FormData['phase']
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="idea">Idea</option>
                    <option value="prototype">Prototype</option>
                    <option value="development">Development</option>
                    <option value="growth">Growth</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as FormData['status']
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      visibility: e.target.value as FormData['visibility']
                    }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {/* Goals & Outcomes */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Goals & Outcomes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Outcomes
                  </label>
                  <textarea
                    value={formData.expectedOutcomes}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcomes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Goals (one per line)
                  </label>
                  <textarea
                    value={formData.projectGoals}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectGoals: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter each goal on a new line"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 