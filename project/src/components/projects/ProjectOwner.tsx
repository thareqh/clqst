import { motion } from 'framer-motion';

interface ProjectOwnerProps {
  owner?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export function ProjectOwner({ owner }: ProjectOwnerProps) {
  if (!owner) return null;

  const initials = owner.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {owner.avatar ? (
          <img
            src={owner.avatar}
            alt={owner.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-gray-600">{initials}</span>
        )}
      </div>
      <span className="text-sm text-gray-600">{owner.name}</span>
    </motion.div>
  );
}