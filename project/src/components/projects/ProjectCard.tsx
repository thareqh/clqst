import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { ProjectStatus } from './ProjectStatus';
import { ProjectSkills } from './ProjectSkills';
import type { Project } from '../../types/project';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const [ownerData, setOwnerData] = useState(project?.owner || null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch latest owner data
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!project?.owner?.id) return;
      
      try {
        const ownerDoc = await getDoc(doc(db, 'users', project.owner.id));
        if (ownerDoc.exists()) {
          const data = ownerDoc.data();
          setOwnerData({
            id: project.owner.id,
            name: data.fullName || project.owner.name || 'Unknown User',
            avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || data.photo || null,
          });
        }
      } catch (error) {
        console.error('Error fetching owner data:', error);
      }
    };

    fetchOwnerData();
  }, [project?.owner?.id]);

  // Determine user role in project
  useEffect(() => {
    if (!user) return;

    if (project.owner?.id === user.uid) {
      setUserRole('Owner');
    } else {
      const member = project.members?.find(m => m.id === user.uid);
      if (member?.role) {
        setUserRole(member.role);
      }
    }
  }, [project, user]);

  if (!project) return null;

  return (
    <Link to={`/app/projects/${project.id}`}>
      <Card className="group hover:shadow-lg transition-all h-full flex flex-col overflow-hidden">
        {/* Project Cover Image */}
        <div className="relative w-full pt-[56.25%] bg-gray-100">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-4xl">🎯</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <ProjectStatus status={project.status} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <motion.h3 
              className="text-xl font-medium group-hover:text-gray-600 transition-colors"
              whileHover={{ x: 4 }}
            >
              {project.title}
            </motion.h3>

            {/* Role Chip */}
            {userRole && (
              <span className={`
                px-2.5 py-1 text-xs font-medium rounded-full
                ${userRole === 'Owner' 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'bg-gray-50 text-gray-600'}
              `}>
                {userRole}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-6 line-clamp-2">
            {project.shortDescription}
          </p>

          <ProjectSkills skills={project.skills || []} className="mb-6" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
            {/* Owner Info */}
            <div className="flex items-center gap-2">
              {ownerData?.avatar ? (
                <img
                  src={ownerData.avatar}
                  alt={ownerData.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const div = document.createElement('div');
                      div.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center';
                      const span = document.createElement('span');
                      span.className = 'text-sm text-primary-700';
                      span.textContent = (ownerData.name || 'U').charAt(0).toUpperCase();
                      div.appendChild(span);
                      parent.appendChild(div);
                    }
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-sm text-primary-700">
                    {(ownerData?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">{ownerData?.name || 'Unknown User'}</span>
            </div>

            <motion.span 
              className="text-sm font-medium text-gray-600 flex items-center gap-2 group-hover:text-gray-900"
              whileHover={{ x: 4 }}
            >
              View Details
              <span className="text-lg">→</span>
            </motion.span>
          </div>
        </div>
      </Card>
    </Link>
  );
}