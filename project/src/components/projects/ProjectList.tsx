import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ProjectStatus } from './ProjectStatus';
import type { Project } from '../../types/project';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🤔</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
        <p className="text-gray-600">
          There are no projects to display at the moment
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link key={project.id} to={`/app/projects/${project.id}`}>
          <Card className="h-full hover:shadow-lg transition-all">
            <div className="relative h-48">
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover rounded-t-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                  <span className="text-4xl">🎯</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <ProjectStatus status={project.status} />
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-medium mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.shortDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {project.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                    +{project.skills.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200">
                    {project.owner.avatar && (
                      <img
                        src={project.owner.avatar}
                        alt={project.owner.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {project.owner.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500 hover:text-gray-700">
                  View Details →
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}