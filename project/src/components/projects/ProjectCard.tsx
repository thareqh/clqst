import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { ProjectStatus } from './ProjectStatus';
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

  if (!project) return null;

  return (
    <Link to={`/app/projects/${project.id}`}>
      <Card className="group border border-gray-200 hover:border-gray-300 transition-all h-full">
        <div className="p-6 flex flex-col h-full">
          {/* Project Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Status Chip */}
            {project.status === 'open' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-green-50 border border-green-100 text-green-600 rounded-full text-xs font-medium">
                Open for Contributors
              </span>
            )}
            {/* Category Chip */}
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-medium capitalize">
              {project.category}
            </span>
            {/* Phase Chip */}
            <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full text-xs font-medium capitalize">
              {project.phase}
            </span>
          </div>

          {/* Main Content */}
          <div className="flex gap-5 mb-6">
            {/* Project Image */}
            <div className="shrink-0 pt-1">
              {project.coverImage ? (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-gray-100">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-gray-100 flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors">
                {project.title}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{project.shortDescription}</p>
            </div>
          </div>

          {/* Skills Section */}
          {project.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {project.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {project.skills.length > 5 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded-full text-xs font-medium">
                  +{project.skills.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Owner Info */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-2 min-w-0">
              {ownerData?.avatar ? (
                <img
                  src={ownerData.avatar}
                  alt={ownerData.name}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100">
                  <span className="text-xs font-medium text-primary-700">
                    {(ownerData?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 truncate">{ownerData?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">{project.members.length} members</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}