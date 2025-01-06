import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { createProject } from '../../../services/projectService';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ProjectBasicInfo } from './steps/ProjectBasicInfo';
import { ProjectRoles } from './steps/ProjectRoles';
import { ProjectVisibility } from './steps/ProjectVisibility';
import type { Project, ProjectRole } from '../../../types/project';

export function ProjectCreateForm() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    tags: [],
    skills: [],
    requiredRoles: [] as ProjectRole[],
    visibility: 'public' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    setIsLoading(true);
    try {
      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        status: 'open',
        owner: {
          id: currentUser.uid,
          name: userProfile.fullName,
          avatar: userProfile.profileImage
        },
        members: [{
          id: currentUser.uid,
          name: userProfile.fullName,
          avatar: userProfile.profileImage,
          role: 'owner',
          joinedAt: new Date().toISOString()
        }]
      };

      await createProject(projectData);
      navigate('/app/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    <ProjectBasicInfo 
      data={formData}
      onChange={data => setFormData(prev => ({ ...prev, ...data }))}
    />,
    <ProjectRoles
      data={formData}
      onChange={data => setFormData(prev => ({ ...prev, ...data }))}
    />,
    <ProjectVisibility
      data={formData}
      onChange={data => setFormData(prev => ({ ...prev, ...data }))}
    />
  ];

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {steps[currentStep - 1]}

        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
          
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isLoading}
            >
              Create Project
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}