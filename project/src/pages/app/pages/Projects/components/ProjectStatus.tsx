interface ProjectStatusProps {
  status: 'draft' | 'open' | 'in-progress' | 'completed';
}

export function ProjectStatus({ status }: ProjectStatusProps) {
  const statusStyles = {
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusStyles[status]}`}>
      {status}
    </span>
  );
}