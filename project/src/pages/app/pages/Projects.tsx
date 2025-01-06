import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ProjectList } from './Projects/components/ProjectList';
import type { Project } from '@/types/project';

export function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Query untuk semua proyek
    const projectsQuery = query(
      collection(db, 'projects')
    );

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const allProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Filter proyek yang dimiliki atau sebagai member
      const myProjects = allProjects.filter(project => {
        const isOwner = project.owner?.id === user.uid;
        const isMember = project.members?.some(member => member.id === user.uid);
        return isOwner || isMember;
      });

      console.log('My Projects:', {
        all: allProjects,
        filtered: myProjects,
        userId: user.uid
      });

      setProjects(myProjects);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your projects</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/app/projects/create')}
          className="flex items-center gap-2"
        >
          Create Project
        </Button>
      </div>

      <ProjectList 
        projects={projects}
        isLoading={isLoading}
      />
    </div>
  );
}