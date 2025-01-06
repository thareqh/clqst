import { motion } from 'framer-motion';

interface ProjectSkillsProps {
  skills?: string[];
  limit?: number;
  className?: string;
}

export function ProjectSkills({ skills = [], limit = 3, className = '' }: ProjectSkillsProps) {
  const displayedSkills = limit > 0 ? skills.slice(0, limit) : skills;
  const remainingCount = limit > 0 ? skills.length - limit : 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayedSkills.map((skill) => (
        <span
          key={skill}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
        >
          {skill}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}