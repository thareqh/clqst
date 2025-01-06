import { FiUsers } from 'react-icons/fi';

interface ProjectStatusProps {
  status: 'open' | 'closed' | 'completed';
  className?: string;
}

export function ProjectStatus({ status, className = '' }: ProjectStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'open':
        return {
          label: 'Open for Contributors',
          icon: <FiUsers className="w-3.5 h-3.5" />,
          className: 'bg-white/80 backdrop-blur-sm'
        };
      case 'closed':
        return {
          label: 'Closed',
          className: 'bg-white/80 backdrop-blur-sm'
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-white/80 backdrop-blur-sm'
        };
      default:
        return {
          label: status,
          className: 'bg-white/80 backdrop-blur-sm'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-gray-700 ${config.className} ${className}`}
    >
      {config.icon}
      {config.label}
    </div>
  );
}