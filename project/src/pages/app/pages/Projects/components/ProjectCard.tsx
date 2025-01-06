import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../../../../components/ui/Card';
import { ProjectStatus } from '../../../../../components/projects/ProjectStatus';
import { ProjectSkills } from '../../../../../components/projects/ProjectSkills';
import { ProjectOwner } from './ProjectOwner';
import type { Project } from '../../../../../types/project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
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
          <motion.h3 
            className="text-xl font-medium group-hover:text-gray-600 transition-colors mb-3"
            whileHover={{ x: 4 }}
          >
            {project.title}
          </motion.h3>
          
          <p className="text-gray-600 mb-6 line-clamp-2">
            {project.shortDescription}
          </p>

          <ProjectSkills skills={project.skills || []} className="mb-6" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
            <ProjectOwner owner={project.owner} />
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