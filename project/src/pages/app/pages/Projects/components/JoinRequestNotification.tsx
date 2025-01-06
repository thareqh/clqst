import { useState, useEffect } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import type { ProjectJoinRequest, ProjectAttachment } from '../../../../../types/project';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface JoinRequestNotificationProps {
  request: ProjectJoinRequest;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export function JoinRequestNotification({ request, onAccept, onReject }: JoinRequestNotificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [userData, setUserData] = useState<{ fullName?: string; avatar?: string; profileImage?: string; photoURL?: string } | null>(null);

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', request.projectId));
        if (projectDoc.exists()) {
          setProjectName(projectDoc.data().title);
        }
      } catch (error) {
        console.error('Error fetching project name:', error);
      }
    };

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', request.userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchProjectName();
    fetchUserData();
  }, [request.projectId, request.userId]);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await onAccept(request.id);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await onReject(request.id);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {(userData?.avatar || userData?.profileImage || userData?.photoURL || request.user.avatar) ? (
                <img 
                  src={userData?.avatar || userData?.profileImage || userData?.photoURL || request.user.avatar}
                  alt={userData?.fullName || request.user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white">
                  <span className="text-lg font-medium text-primary-700">
                    {(userData?.fullName || request.user.name).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{userData?.fullName || request.user.name}</h3>
              <p className="text-sm text-gray-500">
                Requested to join{' '}
                <span className="font-medium text-gray-900">{projectName || 'Loading...'}</span>
                {request.role && (
                  <>
                    {' '}as{' '}
                    <span 
                      className="px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center"
                      style={{ 
                        backgroundColor: request.role.color ? `${request.role.color}15` : '#f3f4f6',
                        color: request.role.color || '#6b7280'
                      }}
                    >
                      {request.role.title}
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(request.createdAt)}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="text-red-600 hover:bg-red-50 border-red-200"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAccept}
              loading={isLoading}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-white">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Message</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {request.message || 'No message provided'}
                </p>
              </div>
            </div>

            {request.attachments && request.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                <div className="space-y-2">
                  {request.attachments.map((file: ProjectAttachment, index: number) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 group"
                    >
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 group-hover:text-primary-600">
                        {file.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
} 