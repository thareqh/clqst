import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { JoinRequestNotification } from '../Projects/components/JoinRequestNotification';
import type { ProjectJoinRequest } from '@/types/project';
import { 
  FiFolder as FolderIcon,
  FiClipboard as ClipboardIcon,
  FiUsers as UsersIcon,
  FiCalendar as CalendarIcon,
  FiClock as ClockIcon,
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiMessageCircle as ChatBubbleIcon,
  FiBell as BellIcon,
  FiArrowUp as ArrowUpIcon
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface JoinRequestUpdate {
  id: string;
  projectId: string;
  status: 'accepted' | 'rejected';
  updatedAt: string;
}

// Komponen Badge sederhana
function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'green' | 'gray' }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinRequests, setJoinRequests] = useState<ProjectJoinRequest[]>([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [myJoinRequestUpdates, setMyJoinRequestUpdates] = useState<JoinRequestUpdate[]>([]);

  // Subscribe to join requests for all projects owned by the user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('status', '==', 'pending'),
      where('projectOwnerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectJoinRequest[];

      setJoinRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to my join request updates
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('userId', '==', user.uid),
      where('status', 'in', ['accepted', 'rejected'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JoinRequestUpdate[];

      setMyJoinRequestUpdates(updates);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to unread chats
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'messages'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadChats(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAcceptRequest = async (requestId: string) => {
    // Logic will be handled in JoinRequestNotification component
    navigate(`/app/projects/${joinRequests.find(r => r.id === requestId)?.projectId}`);
  };

  const handleRejectRequest = async (requestId: string) => {
    // Logic will be handled in JoinRequestNotification component
    navigate(`/app/projects/${joinRequests.find(r => r.id === requestId)?.projectId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.displayName}</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your projects</p>
      </div>

      {/* Notifications */}
      <Card className="mb-8 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {(joinRequests.length > 0 || unreadChats > 0 || myJoinRequestUpdates.length > 0) && (
              <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-full">
                {joinRequests.length + (unreadChats || 0) + myJoinRequestUpdates.length} new
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Join Requests */}
          {joinRequests.length > 0 && joinRequests.map((request) => (
            <div key={request.id} className="p-4 bg-white hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{request.user.name}</span> requested to join{' '}
                    <span className="font-medium">{request.projectId}</span>
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* My Join Request Updates */}
          {myJoinRequestUpdates.map((update) => (
            <div key={update.id} className="p-4 bg-white hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  update.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {update.status === 'accepted' ? (
                    <CheckIcon className={`w-5 h-5 ${
                      update.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  ) : (
                    <XIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Your request to join <span className="font-medium">{update.projectId}</span> was{' '}
                    <span className={`font-medium ${
                      update.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {update.status}
                    </span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(update.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* Unread Chats */}
          {unreadChats > 0 && (
            <div className="p-4 bg-white hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ChatBubbleIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    You have <span className="font-medium">{unreadChats} unread messages</span>
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1"
                    onClick={() => navigate('/app/chat')}
                  >
                    View Messages
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {joinRequests.length === 0 && !unreadChats && myJoinRequestUpdates.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BellIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No new notifications</h3>
              <p className="text-sm text-gray-500">We'll notify you when something arrives</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Projects</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">12</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              3 new
            </span>
            <span className="text-gray-500 ml-2">this month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <ClipboardIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              5 completed
            </span>
            <span className="text-gray-500 ml-2">this week</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="w-4 h-4 mr-1" />
              2 new
            </span>
            <span className="text-gray-500 ml-2">collaborators</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">5</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              3 due soon
            </span>
            <span className="text-gray-500 ml-2">this week</span>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Project Item */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="text-xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Project Name</h3>
                      <p className="text-sm text-gray-600">Last updated 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center">
                        <span className="text-sm text-primary-700">JD</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                        <span className="text-sm text-blue-700">AM</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center">
                        <span className="text-sm text-purple-700">+2</span>
                      </div>
                    </div>
                    <Badge color="green">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="text-sm text-gray-900">New comment on <span className="font-medium">Project Name</span></p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="relative pl-8">
                  <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm text-gray-900">Completed milestone <span className="font-medium">Frontend MVP</span></p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Project Milestone</h3>
                    <p className="text-xs text-red-500 mt-1">Due in 2 days</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Button variant="primary" className="w-full">
                  Create New Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/explore')}
                  className="w-full"
                >
                  Browse Projects
                </Button>
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm text-primary-700">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">Frontend Developer</p>
                    </div>
                  </div>
                  <Badge color="green">Online</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 