import { ResourcesTab } from './FileManager';

interface ResourcesProps {
  projectId: string;
}

export function Resources({ projectId }: ResourcesProps) {
  return (
    <div className="container mx-auto py-6">
      <ResourcesTab projectId={projectId} />
    </div>
  );
} 