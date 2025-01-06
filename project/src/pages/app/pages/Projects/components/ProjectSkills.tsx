interface ProjectSkillsProps {
  skills: string[];
  limit?: number;
}

export function ProjectSkills({ skills = [], limit = 3 }: ProjectSkillsProps) {
  if (!skills.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {skills.slice(0, limit).map((skill) => (
        <span
          key={skill}
          className="px-2 py-1 bg-gray-100 rounded-full text-sm"
        >
          {skill}
        </span>
      ))}
      {skills.length > limit && (
        <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
          +{skills.length - limit} more
        </span>
      )}
    </div>
  );
}