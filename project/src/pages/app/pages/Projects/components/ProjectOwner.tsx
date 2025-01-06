import { Avatar } from '../../../../../components/ui/Avatar';

interface ProjectOwnerProps {
  owner: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export function ProjectOwner({ owner }: ProjectOwnerProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={owner.avatar || undefined}
        alt={owner.name}
        fallback={owner.name.charAt(0).toUpperCase()}
        size="sm"
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{owner.name}</p>
        <p className="text-xs text-gray-500">Project Owner</p>
      </div>
    </div>
  );
}