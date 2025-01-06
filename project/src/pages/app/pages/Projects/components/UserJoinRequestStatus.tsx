import { useState } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import type { ProjectJoinRequest } from '../../../../../types/project';

interface UserJoinRequestStatusProps {
  request: ProjectJoinRequest;
  onViewProject: () => void;
}

export function UserJoinRequestStatus({ request, onViewProject }: UserJoinRequestStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Request Accepted';
      case 'rejected':
        return 'Request Declined';
      default:
        return 'Request Pending';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Congratulations! Your request to join has been accepted. You can now access the project workspace.';
      case 'rejected':
        return 'Unfortunately, your request to join has been declined. You may try applying for other roles or projects.';
      default:
        return 'Your request is being reviewed by the project owner. We\'ll notify you once they make a decision.';
    }
  };

  return (
    <Card className={`p-4 ${request.status === 'pending' ? 'hover:bg-gray-50' : ''} transition-colors`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span 
                className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}
              >
                {getStatusText(request.status)}
              </span>
              <p className="text-xs text-gray-400">
                {formatDate(request.createdAt)}
              </p>
            </div>
            <div className="mt-2">
              <h3 className="font-medium">Request to join project as{' '}
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${request.role.color}15`,
                    color: request.role.color
                  }}
                >
                  {request.role.title}
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getStatusMessage(request.status)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'View Details'}
            </Button>
            {request.status === 'accepted' && (
              <Button
                variant="primary"
                size="sm"
                onClick={onViewProject}
              >
                Go to Project
              </Button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="pl-13 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Your Message</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">
                {request.message}
              </p>
            </div>

            {request.attachments && request.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your Attachments</h4>
                <div className="space-y-2">
                  {request.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-primary-600 hover:underline">
                        {file.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 