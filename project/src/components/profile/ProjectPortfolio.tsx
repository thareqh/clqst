import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { ProjectCard } from '../projects/ProjectCard';
import { useAuth } from '../../contexts/AuthContext';
import { searchProjects } from '../../services/projectService';
import type { Project } from '../../types/project';

export function ProjectPortfolio() {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProjects();
  }, [currentUser]);

  const loadUserProjects = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userProjects = await searchProjects({
        query: '',
        limit: 100
      });
      // Filter projects where user is a member
      const filteredProjects = userProjects.filter(project => 
        project.members.some(member => member.id === currentUser.uid)
      );
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        No projects yet. Start by creating or joining a project!
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-4">Project Portfolio</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}