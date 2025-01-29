import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ProjectJoinRequest } from '@/types/project';
import { 
  IoNotificationsOutline,
  IoChatbubbleOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoCheckmarkOutline,
  IoTimeOutline,
  IoEllipsisHorizontalOutline,
  IoArrowForward
} from 'react-icons/io5';
import { FiMessageCircle as ChatBubbleIcon, FiCheck as CheckIcon, FiX as XIcon, FiTrash2 as TrashIcon } from 'react-icons/fi';

interface JoinRequestUpdate {
  id: string;
  projectId: string;
  status: 'accepted' | 'rejected';
  updatedAt: string;
}

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'primary' | 'gray' | 'green' | 'red' }) {
  const colors = {
    primary: 'bg-gray-100 text-gray-600',
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
}

function Avatar({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10'
  };

  return (
    <div className={`${sizes[size]} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden ring-2 ring-white`}>
      {src ? (
        <img 
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f3f4f6&color=4b5563`;
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-100">
          {name[0].toUpperCase()}
        </div>
      )}
    </div>
  );
}

// Format time ago function
function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const timeStamp = new Date(date);
  const secondsAgo = Math.floor((now.getTime() - timeStamp.getTime()) / 1000);
  const minutesAgo = Math.floor(secondsAgo / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (secondsAgo < 30) {
    return 'Just now';
  } else if (secondsAgo < 60) {
    return `${secondsAgo} seconds ago`;
  } else if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  } else if (daysAgo < 7) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  } else {
    return timeStamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [joinRequests, setJoinRequests] = useState<ProjectJoinRequest[]>([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [myJoinRequestUpdates, setMyJoinRequestUpdates] = useState<JoinRequestUpdate[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [latestMessageTime, setLatestMessageTime] = useState(0);

  const totalNotifications = joinRequests.length + myJoinRequestUpdates.length + (unreadChats > 0 ? 1 : 0);

  // Subscribe to join requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('projectOwnerId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectJoinRequest[];

      setJoinRequests(requests);

      // Fetch project names
      const projectIds = requests.map(r => r.projectId);
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

      // Fetch project names
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

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participantIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      let totalUnread = 0;
      let latestMessageTime = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.unreadCount && data.unreadCount[user.uid]) {
          totalUnread += data.unreadCount[user.uid];
          if (data.lastMessageAt) {
            const messageTime = new Date(data.lastMessageAt).getTime();
            latestMessageTime = Math.max(latestMessageTime, messageTime);
          }
        }
      });
      setUnreadChats(totalUnread);
      setLatestMessageTime(latestMessageTime);
    });

    return () => unsubscribe();
  }, [user]);

  // Mendapatkan semua notifikasi yang diurutkan berdasarkan waktu
  const getAllNotifications = () => {
    const allNotifications = [
      // Join requests selalu ditampilkan semua
      ...joinRequests.map(req => ({
        type: 'join_request' as const,
        data: req,
        time: new Date(req.createdAt).getTime(),
        read: false
      })),
      // Updates selalu ditampilkan semua 
      ...myJoinRequestUpdates.map(update => ({
        type: 'update' as const,
        data: update,
        time: new Date(update.updatedAt).getTime(),
        read: false
      })),
      // Chat notifications hanya tampilkan 1, sisanya di indikator
      ...(unreadChats > 0 ? [{
        type: 'chat' as const,
        data: { count: unreadChats },
        time: Date.now(),
        read: false
      }] : [])
    ];

    return allNotifications.sort((a, b) => b.time - a.time);
  };

  const notifications = getAllNotifications();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {userProfile?.fullName || user?.displayName}</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your account.</p>
        </div>
        <div className="flex gap-3">
            <Button 
              variant="primary" 
              onClick={() => navigate('/app/projects/create')}
            className="whitespace-nowrap"
            >
            Create Project
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/explore')}
            className="whitespace-nowrap"
            >
            Explore
            </Button>
          </div>
        </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Notifications */}
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {totalNotifications > 0 && (
                  <Badge color="primary">
                    {totalNotifications} new
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/app/notifications')}
                className="text-sm"
              >
                View All
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Notifications */}
            {notifications.length > 0 ? (
              notifications.map(notification => {
                if (notification.type === 'chat' && unreadChats > 0) {
                  return (
                    <div key="chat" className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                          <IoChatbubbleOutline className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{unreadChats}</span> unread messages in your inbox
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {latestMessageTime > 0 ? formatTimeAgo(new Date(latestMessageTime)) : 'Just now'}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/app/chat')}
                              className="text-xs sm:text-sm shrink-0"
                            >
                              View Messages
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (notification.type === 'join_request') {
                  const request = notification.data;
                  return (
                    <div key={request.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {request.user.avatar ? (
                            <img 
                              src={request.user.avatar}
                              alt={request.user.name}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm">
                              <span className="text-base font-medium text-gray-600">
                                {request.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{request.user.name}</span> requested to join{' '}
                                <span className="font-medium">{projectNames[request.projectId] || 'Loading...'}</span>
                                {request.role && (
                                  <>
                                    {' '}as{' '}
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600">
                                      {request.role.title}
                                    </span>
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(request.createdAt)}</p>
                            </div>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => navigate(`/app/projects/${request.projectId}`)}
                              className="text-xs sm:text-sm shrink-0"
                            >
                              View Request
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (notification.type === 'update') {
                  const update = notification.data;
                  return (
                    <div key={update.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border-2 border-white shadow-sm">
                          {update.status === 'accepted' ? (
                            <IoCheckmarkOutline className="w-4 h-4 text-gray-600" />
                          ) : (
                            <IoCloseOutline className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                Your request to join <span className="font-medium">{projectNames[update.projectId] || 'Loading...'}</span> was{' '}
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-600">
                                  {update.status}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(update.updatedAt)}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/app/projects/${update.projectId}`)}
                              className="text-xs sm:text-sm shrink-0"
                            >
                              View Project
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            ) : (
              <div className="p-8">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <IoNotificationsOutline className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">All caught up!</h3>
                  <p className="text-sm text-gray-500">No notifications at the moment</p>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {/* Upcoming Deadlines */}
        {/* ... rest of the code ... */}
      </div>
    </div>
  );
}