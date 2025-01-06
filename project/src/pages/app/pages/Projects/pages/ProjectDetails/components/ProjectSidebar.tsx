import { Card } from '../../../../../../../components/ui/Card';
import type { Project } from '../../../../../../../types/project';

interface ProjectSidebarProps {
  project: Project;
  ownerData: { id: string; name: string; avatar: string | null } | null;
  preview?: boolean;
}

export function ProjectSidebar({ project, ownerData, preview }: ProjectSidebarProps) {
  return (
    <>
      {/* Project Info */}
      <Card>
        <div className="p-6">
          <h3 className="font-medium mb-4">Project Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="font-medium capitalize">{project.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phase</p>
              <p className="font-medium capitalize">{project.phase}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="font-medium capitalize">{project.status}</p>
            </div>
            {!preview && (
              <>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Visibility</p>
                  <p className="font-medium capitalize">{project.visibility}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
            {project.websiteUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Website</p>
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 break-all"
                >
                  {project.websiteUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card>
        <div className="p-6">
          <h3 className="font-medium mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-medium text-primary-600">
                {project.members.length}
              </p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-medium text-primary-600">
                {project.requiredRoles.length}
              </p>
              <p className="text-sm text-gray-600">Open Roles</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
} 