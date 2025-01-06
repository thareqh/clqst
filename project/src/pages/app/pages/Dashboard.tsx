import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ProjectJoinRequest } from '@/types/project';
import { 
  FiMessageCircle as ChatBubbleIcon,
  FiBell as BellIcon,
  FiCheck as CheckIcon,
  FiX as XIcon,
  FiTrash2 as TrashIcon
} from 'react-icons/fi';

interface JoinRequestUpdate {
  id: string;
  projectId: string;
  status: 'accepted' | 'rejected';
  updatedAt: string;
}

interface UserData {
  fullName?: string;
  avatar?: string;
  profileImage?: string;
  photoURL?: string;
}

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'primary' | 'gray' | 'green' | 'red' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    gray: 'bg-gray-50 text-gray-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[color]}`}>
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
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, UserData>>({});

  // Fungsi untuk mengambil data profil pengguna
  const fetchUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfiles(prev => ({
          ...prev,
          [userId]: userDoc.data() as UserData
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fungsi untuk menghapus notifikasi join request
  const handleDeleteJoinRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'joinRequests', requestId));
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error deleting join request:', error);
    }
  };

  // Fungsi untuk menghapus notifikasi update
  const handleDeleteUpdate = async (updateId: string) => {
    try {
      await deleteDoc(doc(db, 'joinRequests', updateId));
      setMyJoinRequestUpdates(prev => prev.filter(update => update.id !== updateId));
    } catch (error) {
      console.error('Error deleting update:', error);
    }
  };

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

      // Filter requests for projects owned by the user
      const filteredRequests = requests.filter(request => {
        return request.projectId && request.status === 'pending';
      });

      setJoinRequests(filteredRequests);

      // Fetch project names and user profiles
      const projectIds = [...filteredRequests.map(r => r.projectId)];
      const uniqueProjectIds = [...new Set(projectIds)];
      
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueProjectIds.map(async (projectId) => {
          try {
            const projectDoc = await getDoc(doc(db, 'projects', projectId));
            if (projectDoc.exists()) {
              names[projectId] = projectDoc.data().title;
            }
          } catch (error) {
            console.error('Error fetching project name:', error);
          }
        })
      );
      
      setProjectNames(names);

      // Fetch user profiles
      const userIds = filteredRequests.map(r => r.userId);
      const uniqueUserIds = [...new Set(userIds)];
      await Promise.all(uniqueUserIds.map(fetchUserProfile));
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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JoinRequestUpdate[];

      setMyJoinRequestUpdates(updates);

      // Fetch project names for updates
      const projectIds = updates.map(u => u.projectId);
      const uniqueProjectIds = [...new Set(projectIds)];
      
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueProjectIds.map(async (projectId) => {
          try {
            const projectDoc = await getDoc(doc(db, 'projects', projectId));
            if (projectDoc.exists()) {
              names[projectId] = projectDoc.data().title;
            }
          } catch (error) {
            console.error('Error fetching project name:', error);
          }
        })
      );
      
      setProjectNames(prev => ({ ...prev, ...names }));
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.displayName}</h1>
        </div>
        <p className="text-gray-500">Here's what's happening with your projects today</p>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 overflow-hidden hover:border-primary-100 transition-colors">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="primary" 
              className="w-full justify-center"
              onClick={() => navigate('/app/projects/create')}
            >
              Create New Project
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-center"
              onClick={() => navigate('/app/explore')}
            >
              Browse Projects
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="overflow-hidden hover:border-primary-100 transition-colors">
        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {(joinRequests.length > 0 || unreadChats > 0 || myJoinRequestUpdates.length > 0) && (
              <Badge color="primary">
                {joinRequests.length + (unreadChats || 0) + myJoinRequestUpdates.length} new
              </Badge>
            )}
          </div>
        </div>

        {joinRequests.length === 0 && !unreadChats && myJoinRequestUpdates.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 m-6 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500">No new notifications at the moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Join Requests */}
            {joinRequests.length > 0 && joinRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {(userProfiles[request.userId]?.avatar || 
                      userProfiles[request.userId]?.profileImage || 
                      userProfiles[request.userId]?.photoURL || 
                      request.user.avatar) ? (
                      <img 
                        src={userProfiles[request.userId]?.avatar || 
                             userProfiles[request.userId]?.profileImage || 
                             userProfiles[request.userId]?.photoURL || 
                             request.user.avatar}
                        alt={userProfiles[request.userId]?.fullName || request.user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-lg font-medium text-primary-700">
                          {(userProfiles[request.userId]?.fullName || request.user.name).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{userProfiles[request.userId]?.fullName || request.user.name}</span> requested to join{' '}
                      <span className="font-medium">{projectNames[request.projectId] || 'Loading...'}</span>
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
                    <div className="mt-2 flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => navigate(`/app/projects/${request.projectId}`)}
                      >
                        View Request
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJoinRequest(request.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {/* My Join Request Updates */}
            {myJoinRequestUpdates.map((update) => (
              <div key={update.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm"
                    style={{
                      backgroundColor: update.status === 'accepted' ? '#ecfdf5' : '#fef2f2',
                      color: update.status === 'accepted' ? '#059669' : '#dc2626'
                    }}
                  >
                    {update.status === 'accepted' ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <XIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Your request to join <span className="font-medium">{projectNames[update.projectId] || 'Loading...'}</span> was{' '}
                      <Badge color={update.status === 'accepted' ? 'green' : 'red'}>
                        {update.status}
                      </Badge>
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/app/projects/${update.projectId}`)}
                      >
                        View Project
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(update.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {/* Unread Chats */}
            {unreadChats > 0 && (
              <div className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                    <ChatBubbleIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      You have <Badge color="primary">{unreadChats} unread messages</Badge>
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/app/chat')}
                    >
                      View Messages
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}