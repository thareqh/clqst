import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { searchProjects } from '../../../../services/projectService';
import { ProjectList } from './components/ProjectList';
import type { Project } from '../../../../types/project';

export function Projects() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userProjects = await searchProjects({
        query: '',
        limit: 100
      });
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium">Projects</h1>
        <Button onClick={() => navigate('/app/projects/create')}>
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <ProjectList 
          projects={projects}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}