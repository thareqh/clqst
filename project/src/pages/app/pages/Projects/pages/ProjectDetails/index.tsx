import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProject, addProjectImage, removeProjectImage } from '@/services/projectService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProjectStatus } from '@/components/projects/ProjectStatus';
import { ProjectSkills } from '@/components/projects/ProjectSkills';
import { JoinProjectModal } from './components/JoinProjectModal';
import type { Project, ProjectMilestone, ProjectRole, ProjectJoinRequest } from '@/types/project';
import { doc, getDoc, addDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatBytes } from '@/utils/formatBytes';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { JoinRequestNotification } from '../../components/JoinRequestNotification';
import { CommunicationHub } from '../../components/communication/CommunicationHub';
import { ThreadView } from '../../components/communication/ThreadView';
import { ProjectTasks } from './components/ProjectTasks';
import { ResourcesTab } from '@/pages/app/pages/Projects/components/FileManager';
import { EditProjectModal } from '@/pages/app/pages/Projects/components/modals/EditProjectModal';
import { RoleModal } from '@/pages/app/pages/Projects/components/modals/RoleModal';
import { MilestoneModal } from '@/pages/app/pages/Projects/components/modals/MilestoneModal';
import { EditSkillsModal } from '@/pages/app/pages/Projects/components/modals/EditSkillsModal';
import { FiArrowLeft, FiMoreHorizontal } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ProjectGallery } from './components/ProjectGallery';
import { Dialog } from '@headlessui/react';
import { NewThreadModal } from './components/NewThreadModal';
import { ThreadMenu } from './components/ThreadMenu';
import { AssignRoleModal } from './components/AssignRoleModal';
import { AddMemberModal } from './components/AddMemberModal';
import { NewTaskModal } from './components/NewTaskModal';
import { Portal } from '@headlessui/react';
import { AssignTaskModal } from './components/AssignTaskModal';

interface MemberData {
  name: string;
  avatar: string | null;
}

interface MembersDataMap {
  [key: string]: MemberData;
}

interface StorageInfo {
  used: number;
  limit: number;
  files: number;
}

interface MembershipTier {
  name: 'free' | 'pro';
  projectLimit: number;
  storageLimit: number;
  features: string[];
}

const MEMBERSHIP_TIERS: Record<string, MembershipTier> = {
  free: {
    name: 'free',
    projectLimit: 1,
    storageLimit: 512 * 1024 * 1024, // 512MB in bytes
    features: [
      'Basic chat & communication',
      'Limited file sharing',
      'Project card creation',
      'View public projects',
      'Join as contributor',
      'Basic profile customization'
    ]
  },
  pro: {
    name: 'pro',
    projectLimit: 10,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    features: [
      'Voice channels',
      'Screen sharing',
      'Advanced file management',
      'Custom roles creation',
      'Analytics dashboard',
      'Priority in discovery',
      'Custom project card design',
      'Priority support',
      'Limited API access'
    ]
  }
};

type TabType = 'overview' | 'team' | 'tasks' | 'discussions' | 'files' | 'gallery' | 'communication' | 'resources' | 'activity' | 'settings';

// Type definition untuk project status
type ProjectStatusType = 'open' | 'closed' | 'completed' | 'archived';

// Tambahkan interface untuk Activity
interface ActivityType {
  id: string;
  user: {
    name: string;
    avatar?: string;
    photoURL?: string;
    profileImage?: string;
  };
  action: string;
  target: string;
  timestamp: string;
  type: 'join' | 'leave' | 'create' | 'update' | 'delete' | 'upload' | 'comment';
}

// Tambahkan interface untuk Project Member
interface ProjectMember {
  id: string;
  name: string;
  avatar: string | undefined;
  role?: string;
  joinedAt: string;
  skills?: string[];
}

// Update the Project interface
interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  phase: string;
  status: ProjectStatusType;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
  images?: { url: string }[];
  coverImage?: string;
  problemStatement: string;
  expectedOutcomes: string;
  targetAudience: string;
  projectGoals: string[];
  requiredRoles: ProjectRole[];
  skills?: string[];
  milestones: ProjectMilestone[];
}

// Update ProjectType to extend Project
interface ProjectType extends Project {
  // Add any additional fields specific to ProjectType
}

// Fungsi helper untuk menentukan status proyek
const getProjectDisplayStatus = (status: ProjectStatusType | undefined): 'open' | 'closed' | 'completed' => {
  if (!status) return 'completed';
  
  if (status === 'open') return 'open';
  if (status === 'closed' || status === 'archived') return 'closed';
  return 'completed';
};

// Tambahkan fungsi helper untuk mengelompokkan aktivitas berdasarkan hari
const groupActivitiesByDay = (activities: ActivityType[]) => {
  const groups = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(activity);
    return acc;
  }, {} as Record<string, ActivityType[]>);

  return Object.entries(groups);
};

// Fungsi untuk mendapatkan warna berdasarkan tipe aktivitas
const getActivityColor = (type: ActivityType['type']) => {
  switch (type) {
    case 'create':
      return 'bg-green-100 text-green-800';
    case 'update':
      return 'bg-blue-100 text-blue-800';
    case 'delete':
      return 'bg-red-100 text-red-800';
    case 'join':
      return 'bg-purple-100 text-purple-800';
    case 'leave':
      return 'bg-orange-100 text-orange-800';
    case 'upload':
      return 'bg-indigo-100 text-indigo-800';
    case 'comment':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fungsi untuk mendapatkan ikon berdasarkan tipe aktivitas
const getActivityIcon = (type: ActivityType['type']) => {
  switch (type) {
    case 'create':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    case 'update':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'delete':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      );
    case 'join':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'leave':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      );
    case 'upload':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case 'comment':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

const ACTIVITIES_PER_PAGE = 10;

// Add getActivityLabel function at the top level
function getActivityLabel(type: 'create' | 'update' | 'delete' | 'join' | 'leave' | 'upload' | 'comment'): string {
  const labels = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    join: 'Joined',
    leave: 'Left',
    upload: 'Uploaded',
    comment: 'Commented'
  };
  return labels[type] || type;
}

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<{ id: string; name: string } | null>(null);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [threads, setThreads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [ownerData, setOwnerData] = useState<{ id: string; name: string; avatar: string | undefined } | null>(null);
  const [membersData, setMembersData] = useState<Record<string, { id: string; name: string; avatar: string | undefined }>>({});
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'rejected'>('none');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 5000000000, files: 0 });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedThreadForReply, setSelectedThreadForReply] = useState<string | null>(null);
  const [replyingToThread, setReplyingToThread] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const isProjectOwner = project?.owner.id === user?.uid;
  const isProjectMember = project?.members.some(member => member.id === user?.uid);
  const hasProjectAccess = isProjectMember || isProjectOwner;

  // Fungsi untuk menghitung persentase penggunaan storage
  const storageUsagePercent = (storageInfo.used / storageInfo.limit) * 100;
  const isStorageFull = storageInfo.used >= storageInfo.limit;

  // Perbaikan untuk perbandingan status
  const canDeleteProject = project?.status && (project.status as ProjectStatusType) !== 'closed';

  // Fetch owner data
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!project?.owner?.id) return;
      
      try {
        const ownerDoc = await getDoc(doc(db, 'users', project.owner.id));
        if (ownerDoc.exists()) {
          const data = ownerDoc.data();
          console.log('Raw owner data:', data); // Debug log

          // Cek semua kemungkinan field foto profil
          const avatarUrl = data.profileImage || 
                           data.photoURL || 
                           data.avatar || 
                           data.profilePicture || 
                           data.photo || 
                           project.owner.avatar;

          console.log('Selected avatar URL:', avatarUrl); // Debug log

          setOwnerData({
            id: project.owner.id,
            name: data.fullName || data.displayName || project.owner.name || 'Unknown User',
            avatar: avatarUrl || null // Pastikan selalu ada nilai, null jika tidak ada
          });
        } else {
          console.log('Owner document does not exist'); // Debug log
          // Fallback ke data proyek jika dokumen user tidak ditemukan
          setOwnerData({
            id: project.owner.id,
            name: project.owner.name || 'Unknown User',
            avatar: project.owner.avatar || null
          });
        }
      } catch (error) {
        console.error('Error fetching owner data:', error);
        // Fallback ke data proyek jika terjadi error
        setOwnerData({
          id: project.owner.id,
          name: project.owner.name || 'Unknown User',
          avatar: project.owner.avatar || null
        });
      }
    };

    fetchOwnerData();
  }, [project?.owner?.id]);

  // Fetch members data
  useEffect(() => {
    const fetchMembersData = async () => {
      if (!project) return;
      
      try {
        // Get data for existing members
        const memberPromises = project.members.map(async (member) => {
          const memberDoc = await getDoc(doc(db, 'users', member.id));
          if (memberDoc.exists()) {
            const data = memberDoc.data();
            return {
              [member.id]: {
                id: member.id,
                name: data.fullName || data.displayName || member.name,
                avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || data.photo || member.avatar
              }
            };
          }
          return {
            [member.id]: { 
              id: member.id,
              name: member.name, 
              avatar: member.avatar 
            }
          };
        });

        // Get data for join requests
        const requestPromises = joinRequests.map(async (request) => {
          const userDoc = await getDoc(doc(db, 'users', request.userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            return {
              [request.userId]: {
                id: request.userId,
                name: data.fullName || data.displayName || request.user.name,
                avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || data.photo || request.user.avatar
              }
            };
          }
          return {
            [request.userId]: { 
              id: request.userId,
              name: request.user.name, 
              avatar: request.user.avatar 
            }
          };
        });

        const results = await Promise.all([...memberPromises, ...requestPromises]);
        const newMembersData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setMembersData(newMembersData);
      } catch (error) {
        console.error('Error fetching members data:', error);
      }
    };

    fetchMembersData();
  }, [project?.members, joinRequests]);

  // Update the loadProject function
  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const projectData = await getProject(id);
        setProject(projectData as ProjectType);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // Update activities fetch
  useEffect(() => {
    if (!project?.id) return;

    const q = query(
      collection(db, 'projectActivities'),
      where('projectId', '==', project.id),
      orderBy('timestamp', 'desc'),
      limit(ACTIVITIES_PER_PAGE * activitiesPage)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const activityList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityType[];
      
      // Check if there are more activities
      const nextQuery = query(
        collection(db, 'projectActivities'),
        where('projectId', '==', project.id),
        orderBy('timestamp', 'desc'),
        limit(ACTIVITIES_PER_PAGE * activitiesPage + 1)
      );
      const nextSnapshot = await getDocs(nextQuery);
      setHasMoreActivities(nextSnapshot.docs.length > activityList.length);
      
      setActivities(activityList);
    });

    return () => unsubscribe();
  }, [project?.id, activitiesPage]);

  // Update threads listener
  useEffect(() => {
    if (!project?.id) return;

    try {
      console.log('Setting up threads listener for project ID:', project.id);

      // Create the query
      const threadsQuery = query(
        collection(db, 'threads'),
        where('projectId', '==', project.id),
        orderBy('createdAt', 'desc')
      );

      console.log('Query created:', threadsQuery);

      // Subscribe to the query
      const unsubscribe = onSnapshot(threadsQuery, 
        (snapshot) => {
          console.log('Received threads snapshot with size:', snapshot.size);
          console.log('Snapshot empty?', snapshot.empty);
          
          const threadList = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Thread document data:', data);
            return {
              id: doc.id,
              ...data
            };
          });

          console.log('Final processed threads:', threadList);
          setThreads(threadList);
        },
        (error) => {
          console.error('Error in threads listener:', error);
          toast.error('Failed to load discussions');
        }
      );

      // Cleanup
      return () => {
        console.log('Cleaning up threads listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up threads listener:', error);
      toast.error('Failed to setup discussions');
    }
  }, [project?.id]);

  // Add tasks listener
  useEffect(() => {
    if (!project?.id) return;

    const q = query(
      collection(db, 'projectTasks'),
      where('projectId', '==', project.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw task data:', {
        id: doc.id,
          ...data,
          assignedTo: data.assignedTo ? {
            id: data.assignedTo.id,
            name: data.assignedTo.name,
            avatar: data.assignedTo.avatar,
            photoURL: data.assignedTo.photoURL,
            profileImage: data.assignedTo.profileImage
          } : null
        });
        return {
          id: doc.id,
          ...data
        };
      });
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [project?.id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = project?.title || 'Project';
    const shareText = project?.shortDescription || 'Check out this project!';

    try {
      if (navigator.share) {
        // Gunakan Web Share API jika tersedia
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Thanks for sharing!');
      } else {
        // Fallback ke clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share project');
    }
  };

  const handleJoinRequest = async (roleId: string | null, message: string, attachments: File[]) => {
    if (!user || !project) return;

    try {
      // Get user profile data first
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      // Upload attachments first
      const uploadedFiles = await Promise.all(
        attachments.map(async (file) => {
          const fileRef = ref(storage, `join-requests/${project.id}/${user.uid}/${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return {
            name: file.name,
            url,
            size: file.size
          };
        })
      );

      // Create join request document
      const joinRequest = {
        projectId: project.id,
        projectOwnerId: project.owner.id,
        userId: user.uid,
        user: {
          id: user.uid,
          name: userData?.fullName || user.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.profileImage || userData?.photoURL || user.photoURL || null
        },
        role: roleId ? project.requiredRoles.find(role => role.title === roleId) : null,
        message,
        attachments: uploadedFiles,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Add request to Firestore
      await addDoc(collection(db, 'joinRequests'), joinRequest);
      
      // Show success message
      toast.success('Join request submitted successfully');
      setShowJoinModal(false);
    } catch (error) {
      console.error('Error submitting join request:', error);
      toast.error('Failed to submit join request');
    }
  };

  // Subscribe to join requests
  useEffect(() => {
    if (!project?.id || !isProjectOwner) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('projectId', '==', project.id),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectJoinRequest[];
      setJoinRequests(requests);
    });

    return () => unsubscribe();
  }, [project?.id, isProjectOwner]);

  const handleAcceptRequest = async (requestId: string) => {
    if (!project?.id) return;

    try {
      // Get the request data first
      const requestRef = doc(db, 'joinRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        toast.error('Request not found');
        return;
      }

      const requestData = requestDoc.data() as ProjectJoinRequest;

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', requestData.userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      // Get role data with null check
      const roleTitle = requestData.role ? requestData.role.title : 'Member';
      const roleSkills = requestData.role ? requestData.role.skills : [];

      // Create new member object
      const newMember = {
        id: requestData.userId,
        name: userData?.fullName || requestData.user.name,
        avatar: userData?.avatar || userData?.profileImage || userData?.photoURL || requestData.user.avatar || null,
        role: roleTitle,
        joinedAt: new Date().toISOString(),
        skills: roleSkills
      };

      if (!project.id) {
        throw new Error('Project ID is required');
      }

      // Update project members
      const projectRef = doc(db, 'projects', project.id);
      const updatedMembers = [...project.members, newMember];
      await updateDoc(projectRef, {
        members: updatedMembers
      });

      // Update request status
      await updateDoc(requestRef, { status: 'accepted' });

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        members: updatedMembers
      } : null);
      
      toast.success('Member added successfully');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'joinRequests', requestId);
      await updateDoc(requestRef, { status: 'rejected' });
      toast.success('Request rejected successfully');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleOpenProjectChat = (channelId: string) => {
    if (!project) return;
    navigate(`/app/chat?projectId=${project.id}&channelId=${channelId}`);
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!project) return;
    
    try {
      await addProjectImage(project.id, imageUrl);
      const updatedProject = {
        ...project,
        images: [...(project.images || []), { url: imageUrl }]
      };
      setProject(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      // TODO: Show error notification
    }
  };

  const handleImageRemove = async (imageUrl: string) => {
    if (!project) return;

    try {
      await removeProjectImage(project.id, imageUrl);
      const updatedProject = {
        ...project,
        images: project.images?.filter(img => img.url !== imageUrl) || []
      };
      setProject(updatedProject);
    } catch (error) {
      console.error('Error removing image:', error);
      // TODO: Show error notification
    }
  };

  const renderSpaceContent = () => {
    if (!id || !project) return null;
    
    let content = null;
    
    switch (activeTab) {
      case 'overview':
        content = (
          <div className="space-y-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Problem & Solution */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden h-full border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Problem & Solution</h2>
                  </div>
              <div className="p-6">
                    <div className="space-y-8">
                      {/* Problem Statement */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center border border-red-100">
                            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">Problem Statement</h3>
                        </div>
                        <div className="pl-10 p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">{project?.problemStatement}</p>
                        </div>
                      </div>

                      {/* Solution */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                      </div>
                          <h3 className="text-sm font-medium text-gray-900">Solution</h3>
                        </div>
                        <div className="pl-10 p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">{project?.expectedOutcomes}</p>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                    </div>
                          <h3 className="text-sm font-medium text-gray-900">Target Audience</h3>
                        </div>
                        <div className="pl-10 p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">{project?.targetAudience}</p>
                        </div>
                      </div>
                </div>
                </div>
              </Card>
              </div>

              {/* Right Column - Project Skills */}
              <div>
                <Card className="overflow-hidden h-full border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Project Skills</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-1.5">
                      {project?.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200 text-gray-800 hover:border-gray-300 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

              {/* Project Goals */}
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">Project Goals</h2>
                </div>
                <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project?.projectGoals?.map((goal: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 border border-primary-100">
                        <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                      <p className="text-sm text-gray-600">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
                </div>
        );
        break;

      case 'communication':
        content = (
          <div className="space-y-8">
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Project Discussions</h2>
                    <p className="mt-1 text-sm text-gray-500">Communicate and collaborate with your team members</p>
                  </div>
                  {isProjectMember && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setShowNewThreadModal(true)}
                      className="flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Discussion
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {Array.isArray(threads) && threads.length > 0 ? (
                  <div className="space-y-6">
                    {threads.map((thread) => (
                      <div key={thread.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {membersData[thread.author?.id]?.avatar ? (
                              <img 
                                src={membersData[thread.author.id].avatar} 
                                alt={membersData[thread.author.id].name || 'User'}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-gray-50 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {membersData[thread.author?.id]?.name?.[0].toUpperCase() || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {membersData[thread.author?.id]?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(thread.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              {(isProjectOwner || thread.author?.id === user?.uid) && (
                                <Menu as="div" className="relative">
                                  <Menu.Button className="p-2 rounded-full hover:bg-gray-50">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </Menu.Button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                      <div className="py-1">
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              onClick={() => handleDeleteThread(thread.id)}
                                              className={`${
                                                active ? 'bg-gray-50' : ''
                                              } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                                            >
                                              <svg className="mr-3 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                              Delete Thread
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{thread.content}</p>
                            </div>
                            
                            {/* Replies Section */}
                            {thread.replies && thread.replies.length > 0 && (
                              <div className="mt-4">
                                <button
                                  onClick={() => toggleReplies(thread.id)}
                                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
                                >
                                  <svg 
                                    className={`w-4 h-4 transition-transform ${expandedThreads.includes(thread.id) ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                {expandedThreads.includes(thread.id) && (
                                  <div className="space-y-4 pl-6 border-l-2 border-gray-100">
                                    {thread.replies.map((reply: any) => (
                                      <div key={reply.id} className="flex items-start gap-3 bg-gray-50/50 rounded-lg p-4">
                                        <div className="flex-shrink-0">
                                          {membersData[reply.author?.id]?.avatar ? (
                                            <img 
                                              src={membersData[reply.author.id].avatar} 
                                              alt={membersData[reply.author.id].name || 'User'}
                                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-white flex items-center justify-center">
                                              <span className="text-xs font-medium text-gray-600">
                                                {membersData[reply.author?.id]?.name?.[0].toUpperCase() || 'U'}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                              {membersData[reply.author?.id]?.name || 'Anonymous'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(reply.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{reply.content}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Reply Button/Form */}
                            {isProjectMember && (
                              <div className="mt-4">
                                {replyingToThread === thread.id ? (
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.currentTarget);
                                      const content = formData.get('content') as string;
                                      if (content.trim()) {
                                        handleAddReply(thread.id, content);
                                        setReplyingToThread(null);
                                        (e.target as HTMLFormElement).reset();
                                      }
                                    }}
                                    className="space-y-3"
                                  >
                                    <textarea
                                      name="content"
                                      rows={2}
                                      className="block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50/50"
                                      placeholder="Write your reply..."
                                      autoFocus
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setReplyingToThread(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        type="submit"
                                        variant="primary"
                                        size="sm"
                                      >
                                        Reply
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <Button
                                    onClick={() => setReplyingToThread(thread.id)}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Reply
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No Discussions Yet
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Start a discussion to collaborate with your team members.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
        break;

      case 'activity':
        content = (
          <div className="space-y-8">
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Project Activity</h2>
                    <p className="mt-1 text-sm text-gray-500">Track all project updates and changes</p>
                  </div>
                  <select 
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    onChange={(e) => {
                      const filtered = activities.filter(activity => {
                        if (e.target.value === 'all') return true;
                        return activity.type === e.target.value;
                      });
                      setActivities(filtered);
                    }}
                  >
                    <option value="all">All Activities</option>
                    <option value="create">Creation</option>
                    <option value="update">Updates</option>
                    <option value="delete">Deletion</option>
                    <option value="join">Joined</option>
                    <option value="leave">Left</option>
                    <option value="upload">Upload</option>
                    <option value="comment">Comment</option>
                  </select>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {Array.isArray(activities) && activities.length > 0 ? (
                  <div className="relative">
                    {groupActivitiesByDay(activities).map(([date, dayActivities]) => (
                      <div key={date} className="relative">
                        <div className="sticky top-0 bg-white px-6 py-3 z-10">
                          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{date}</h3>
                        </div>
                        <div className="px-6">
                          {dayActivities.map((activity) => (
                            <div key={activity.id} className="py-4">
                              <div className="flex items-start gap-4">
                                {activity.user.avatar || activity.user.photoURL || activity.user.profileImage ? (
                                  <img 
                                    src={activity.user.avatar || activity.user.photoURL || activity.user.profileImage} 
                                    alt={activity.user.name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user.name)}&background=random`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white">
                                    <span className="text-sm font-medium text-gray-600">
                                      {activity.user.name[0].toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-gray-900">{activity.user.name}</span>
                                    <span className="text-gray-500">{activity.action}</span>
                                    <span className="font-medium text-gray-900">{activity.target}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                                      {getActivityLabel(activity.type)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {hasMoreActivities && (
                      <div className="flex justify-center py-5 border-t border-gray-100">
                        <Button
                          variant="outline"
                          onClick={() => setActivitiesPage(prev => prev + 1)}
                          className="text-sm"
                        >
                          Load More Activities
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No Activities Yet
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Activities will appear here when team members start interacting with the project.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
        break;

      case 'resources':
        content = (
          <div className="space-y-8">
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Project Resources</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage and share project files and resources</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ResourcesTab projectId={id} />
              </div>
            </Card>
          </div>
        );
        break;

      case 'tasks':
        content = (
          <div className="space-y-8">
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                  <h2 className="text-base font-semibold text-gray-900">Project Tasks</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage and track project tasks</p>
                  </div>
                  {isProjectMember && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setShowNewTaskModal(true)}
                      className="flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Task
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-6">
                {tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                              <div className="space-y-4">
                                {/* Title and Description */}
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>
                                </div>
                                
                                {/* Task Info */}
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                  {/* Due Date */}
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                                  </div>

                                  {/* Created Time */}
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Created {new Date(task.createdAt).toLocaleString()}</span>
                                  </div>

                                  {/* Status Badge */}
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    task.status === 'completed' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' :
                                    task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' :
                                    'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20'
                                  }`}>
                                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                      task.status === 'completed' ? 'bg-green-600' :
                                      task.status === 'in_progress' ? 'bg-blue-600' :
                                      'bg-gray-500'
                                    }`} />
                                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
                                  </span>
                                </div>

                                {/* Assignees Section */}
                                <div className="pt-4 border-t border-gray-100">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                      </svg>
                                      <span className="text-sm font-medium text-gray-700">Assigned to:</span>
                                    </div>
                                  </div>

                                  {/* Assigned Users */}
                                  {task.assignedUsers && task.assignedUsers.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {task.assignedUsers.map((user) => (
                                        <div 
                                          key={user.id} 
                                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                                            user.role?.color ? `border-${user.role.color}-200 bg-${user.role.color}-50` : 'border-gray-200 bg-gray-50'
                                          }`}
                                        >
                                          {user.avatar ? (
                                            <img 
                                              src={user.avatar}
                                              alt={user.name}
                                              className="w-5 h-5 rounded-full object-cover ring-2 ring-white"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ring-2 ring-white">
                                              <span className="text-[10px] font-medium text-gray-600">
                                                {user.name[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                                          <span className={`text-sm ${user.role?.color ? `text-${user.role.color}-700` : 'text-gray-600'}`}>
                                            {user.name}
                                          </span>
                              </div>
                                      ))}
                            </div>
                                  ) : (
                                    <p className="mt-2 text-sm text-gray-500">No assignees yet</p>
                                  )}
                            </div>
                          </div>
                            </div>
                            
                            {/* Task Actions Menu */}
                          {isProjectMember && (
                              <div className="relative">
                                <Menu>
                                  <Menu.Button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                                  <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </Menu.Button>

                                  <Menu.Items className="absolute right-0 mt-1 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] divide-y divide-gray-100">
                                    {/* Status Actions */}
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                            className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                        >
                                          Mark as Completed
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                                            className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                        >
                                          Mark as In Progress
                                        </button>
                                      )}
                                    </Menu.Item>
                                    </div>

                                    {/* Assignment Actions */}
                                    <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              setSelectedTaskId(task.id);
                                              setShowAssignUserModal(true);
                                            }}
                                            className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                          >
                                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            Assign Users
                                          </button>
                                        )}
                                      </Menu.Item>
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => {
                                              setSelectedTaskId(task.id);
                                              setShowAssignRoleModal(true);
                                            }}
                                            className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                                          >
                                            <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Assign Roles
                                          </button>
                                        )}
                                      </Menu.Item>
                                    </div>

                                    {/* Delete Action */}
                                    {(isProjectOwner || task.createdBy.id === user?.uid) && (
                                      <div className="py-1">
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => handleDeleteTask(task.id)}
                                              className={`${active ? 'bg-gray-50' : ''} flex w-full items-center px-4 py-2 text-sm text-red-600`}
                                          >
                                            Delete Task
                                          </button>
                                        )}
                                      </Menu.Item>
                                  </div>
                                    )}
                                </Menu.Items>
                              </Menu>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 015.356-1.857M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No Tasks Yet
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Get started by creating your first task to track project progress.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
        break;

      case 'team':
        content = (
          <div className="space-y-8">
            {/* Team Members List */}
            <Card className="overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
                    <p className="mt-1 text-sm text-gray-500">People working on this project</p>
                  </div>
                  {isProjectOwner && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => setShowAddMemberModal(true)}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Member
                    </Button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {/* Project Owner */}
                <div className="p-6 bg-gradient-to-r from-primary-50/30 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {ownerData?.avatar ? (
                          <img 
                            src={ownerData.avatar} 
                            alt={ownerData.name}
                            className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerData.name)}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-4 ring-white shadow-sm flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-600">
                              {ownerData?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{ownerData?.name}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            Project Owner
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {project.members.filter(member => member.id !== project.owner.id).map((member) => (
                  <div key={member.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-4 ring-gray-50 flex items-center justify-center">
                              <span className="text-lg font-medium text-gray-600">
                                {member.name[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                            {member.role ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                {member.role}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                No Role
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {isProjectOwner && (
                        <Menu as="div" className="relative">
                          <Menu.Button className="p-2 rounded-full hover:bg-gray-100">
                            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 divide-y divide-gray-100">
                              <div className="py-1">
                                {!member.role && project.requiredRoles && project.requiredRoles.length > 0 && (
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => {
                                          setSelectedMemberForRole({ id: member.id, name: member.name });
                                          setShowAssignRoleModal(true);
                                        }}
                                        className={`${
                                          active ? 'bg-gray-50' : ''
                                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`}
                                      >
                                        <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Assign Role
                                      </button>
                                    )}
                                  </Menu.Item>
                                )}
                              </div>
                              <div className="py-1">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => {
                                        setSelectedMemberToRemove({ id: member.id, name: member.name });
                                        setShowRemoveMemberModal(true);
                                      }}
                                      className={`${
                                        active ? 'bg-gray-50' : ''
                                      } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50`}
                                    >
                                      <svg className="mr-3 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                      </svg>
                                      Remove Member
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
        break;

      case 'gallery':
        content = (
          <div className="space-y-8">
          <ProjectGallery
            project={project}
            isProjectOwner={isProjectOwner}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
          </div>
        );
        break;

      default:
        content = null;
        break;
    }

    return content;
  };

  // Render join requests section
  const renderJoinRequests = () => {
    if (!isProjectOwner || joinRequests.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Join Requests</h2>
        <div className="space-y-4">
          {joinRequests.map((request) => (
            <JoinRequestNotification
              key={request.id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))}
        </div>
      </div>
    );
  };

  // Subscribe to user's join request status
  useEffect(() => {
    if (!user?.uid || !project?.id) return;

    const q = query(
      collection(db, 'joinRequests'),
      where('userId', '==', user.uid),
      where('projectId', '==', project.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectJoinRequest[];
      setJoinRequests(requests);
    });

    return () => unsubscribe();
  }, [user?.uid, project?.id]);

  const handleEditRole = (role: ProjectRole) => {
    setSelectedRole(role);
    setShowEditRoleModal(true);
  };

  const handleDeleteRole = async (role: ProjectRole) => {
    if (!project?.id) return;

    try {
      const projectRef = doc(db, 'projects', project.id);
      const updatedRoles = project.requiredRoles.filter(r => r.title !== role.title);

      await updateDoc(projectRef, {
        requiredRoles: updatedRoles,
        updatedAt: new Date().toISOString()
      });

      setProject({
        ...project,
        requiredRoles: updatedRoles
      });

      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleEditMilestone = (milestone: ProjectMilestone) => {
    setSelectedMilestone(milestone);
    setShowEditMilestoneModal(true);
  };

  const handleDeleteMilestone = async (milestone: ProjectMilestone) => {
    if (!project?.id) return;

    try {
      const projectRef = doc(db, 'projects', project.id);
      const updatedMilestones = project.milestones.filter(m => m.title !== milestone.title);

      await updateDoc(projectRef, {
        milestones: updatedMilestones,
        updatedAt: new Date().toISOString()
      });

      setProject({
        ...project,
        milestones: updatedMilestones
      });

      toast.success('Milestone deleted successfully');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
    }
  };

  const handleConfirmDelete = async () => {
    if (!project?.id) {
      throw new Error('Project ID is required');
    }
    
    if (deleteConfirmText !== project.title) {
      toast.error('Please type the project name correctly to confirm deletion');
      return;
    }

    try {
      const docRef = doc(db as any, 'projects', project.id);
      await deleteDoc(docRef);
      toast.success('Project deleted successfully');
      navigate('/app/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleRemoveMember = async () => {
    if (!project?.id || !selectedMemberToRemove) return;

    try {
      const projectRef = doc(db, 'projects', project.id);
      const updatedMembers = project.members.filter(member => member.id !== selectedMemberToRemove.id);

      await updateDoc(projectRef, {
        members: updatedMembers,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        members: updatedMembers
      } : null);

      toast.success('Team member removed successfully');
      setShowRemoveMemberModal(false);
      setSelectedMemberToRemove(null);
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  // Tambahkan fungsi untuk melihat detail aktivitas
  const handleViewActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // Show activity details in a toast notification
    const time = new Date(activity.timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    
    toast(
      <div className="space-y-2">
        <div className="font-medium">Activity Details</div>
        <div className="text-sm">
          <div>User: {activity.user.name}</div>
          <div>Action: {activity.action}</div>
          <div>Target: {activity.target}</div>
          <div>Type: {activity.type}</div>
          <div>Time: {time}</div>
        </div>
      </div>,
      {
        duration: 5000,
        position: 'bottom-right',
      }
    );
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!project?.id) return;

    try {
      console.log('Deleting thread:', threadId);
      await deleteDoc(doc(db, 'threads', threadId));
      console.log('Thread deleted successfully');
      toast.success('Thread deleted successfully');
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error('Failed to delete thread');
    }
  };

  const handleViewThread = (threadId: string) => {
    // Implementasi view thread - bisa navigate ke detail thread atau buka modal
    console.log('View thread:', threadId);
  };

  // Task management functions
  const handleCreateTask = async (taskData: { 
    title: string; 
    description: string;
    dueDate?: string;
    assignedUsers?: { id: string; name: string }[];
    assignedRoles?: { id: string; title: string }[];
  }) => {
    if (!project?.id || !user?.uid) return;

    try {
      // Get user data first
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      // Get assigned users data
      const assignedUsersData = await Promise.all(
        (taskData.assignedUsers || []).map(async (assignedUser) => {
          const userDoc = await getDoc(doc(db, 'users', assignedUser.id));
          const data = userDoc.exists() ? userDoc.data() : null;
          return {
            id: assignedUser.id,
            name: data?.fullName || data?.displayName || assignedUser.name,
            avatar: data?.profileImage || data?.photoURL || data?.avatar || null
          };
        })
      );

      // Create new task
      const newTask = {
        projectId: project.id,
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        status: 'pending',
        dueDate: taskData.dueDate || null,
        createdBy: {
          id: user.uid,
          name: userData?.fullName || userData?.displayName || user.displayName || 'Anonymous',
          avatar: userData?.profileImage || userData?.photoURL || userData?.avatar || user.photoURL || null
        },
        assignedUsers: assignedUsersData,
        assignedRoles: taskData.assignedRoles || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'projectTasks'), newTask);

      // Add activity
      const activity = {
        projectId: project.id,
        type: 'create',
        action: 'created a new task',
        target: taskData.title,
        user: {
          id: user.uid,
          name: userData?.fullName || userData?.displayName || user.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.photoURL || userData?.profileImage || user.photoURL || null,
          photoURL: userData?.photoURL || userData?.avatar || userData?.profileImage || user.photoURL || null,
          profileImage: userData?.profileImage || userData?.photoURL || userData?.avatar || user.photoURL || null
        },
        timestamp: new Date().toISOString()
      };

      // Add to Firestore
      const activityRef = collection(db, 'projectActivities');
      await addDoc(activityRef, activity);

      toast.success('Task created successfully');
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!project?.id) return;

    try {
      const taskRef = doc(db, 'projectTasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success('Task status updated');

      // Add activity
      const activity = {
        projectId: project.id,
        type: 'update',
        action: 'updated task status',
        target: taskDoc.data().title,
        user: {
          id: user?.uid,
          name: userData?.fullName || userData?.displayName || user?.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.photoURL || userData?.profileImage || user?.photoURL || null,
          photoURL: userData?.photoURL || userData?.avatar || userData?.profileImage || user?.photoURL || null,
          profileImage: userData?.profileImage || userData?.photoURL || userData?.avatar || user?.photoURL || null
        },
        timestamp: new Date().toISOString()
      };

      // Add to Firestore
      const activityRef = collection(db, 'projectActivities');
      await addDoc(activityRef, activity);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!project?.id) return;

    try {
      await deleteDoc(doc(db, 'projectTasks', taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  // Update handleCreateThread
  const handleCreateThread = async (threadData: { content: string }) => {
    if (!project?.id || !user?.uid) {
      console.error('Missing project ID or user ID');
      return;
    }

    try {
      // Get user data first
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      const newThread = {
        projectId: project.id,
        content: threadData.content.trim(),
        author: {
          id: user.uid,
          name: userData?.fullName || userData?.displayName || user.displayName || 'Anonymous',
          photoURL: userData?.photoURL || userData?.avatar || userData?.profilePicture || user.photoURL,
          avatar: userData?.photoURL || userData?.avatar || userData?.profilePicture || user.photoURL
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
        likes: []
      };

      // Add to Firestore
      const threadsRef = collection(db, 'threads');
      const docRef = await addDoc(threadsRef, newThread);
      
      // Add activity
      const activity = {
        projectId: project.id,
        type: 'create',
        action: 'posted a new discussion',
        target: threadData.content.slice(0, 50) + (threadData.content.length > 50 ? '...' : ''),
        user: {
          id: user.uid,
          name: userData?.fullName || userData?.displayName || user.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.photoURL || userData?.profileImage || user.photoURL || null,
          photoURL: userData?.photoURL || userData?.avatar || userData?.profileImage || user.photoURL || null,
          profileImage: userData?.profileImage || userData?.photoURL || userData?.avatar || user.photoURL || null
        },
        timestamp: new Date().toISOString()
      };

      // Add to Firestore
      const activityRef = collection(db, 'projectActivities');
      await addDoc(activityRef, activity);
      
      toast.success('Discussion posted successfully');
      setShowNewThreadModal(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to post discussion');
    }
  };

  const handleLikeThread = async (threadId: string) => {
    if (!project?.id || !user?.uid) return;

    try {
      const threadRef = doc(db, 'threads', threadId);
      const threadDoc = await getDoc(threadRef);
      
      if (!threadDoc.exists()) return;
      
      const threadData = threadDoc.data();
      const likes = threadData.likes || [];
      const userLikeIndex = likes.findIndex((like: any) => like.userId === user.uid);
      
      if (userLikeIndex > -1) {
        likes.splice(userLikeIndex, 1);
      } else {
        likes.push({
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          timestamp: new Date().toISOString()
        });
      }
      
      await updateDoc(threadRef, { 
        likes,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating thread likes:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleAddReply = async (threadId: string, content: string) => {
    if (!project?.id || !user?.uid) return;

    try {
      // Get user data first
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      const threadRef = doc(db, 'threads', threadId);
      const threadDoc = await getDoc(threadRef);
      
      if (!threadDoc.exists()) return;
      
      const threadData = threadDoc.data();
      const replies = threadData.replies || [];
      
      replies.push({
        id: crypto.randomUUID(),
        content,
        author: {
          id: user.uid,
          name: userData?.fullName || userData?.displayName || user.displayName || 'Anonymous',
          photoURL: userData?.photoURL || userData?.avatar || userData?.profilePicture || user.photoURL,
          avatar: userData?.photoURL || userData?.avatar || userData?.profilePicture || user.photoURL
        },
        createdAt: new Date().toISOString()
      });
      
      await updateDoc(threadRef, { 
        replies,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleRoleAssignment = async (roleTitle: string) => {
    if (!project?.id || !selectedMemberForRole) return;

    try {
      const projectRef = doc(db, 'projects', project.id);
      const updatedMembers = project.members.map(member => {
        if (member.id === selectedMemberForRole.id) {
          return {
            ...member,
            role: roleTitle
          };
        }
        return member;
      });

      await updateDoc(projectRef, {
        members: updatedMembers,
        updatedAt: new Date().toISOString()
      });

      setProject(prev => prev ? {
        ...prev,
        members: updatedMembers
      } : null);

      toast.success('Role assigned successfully');
      setShowAssignRoleModal(false);
      setSelectedMemberForRole(null);
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  const handleAddRole = async (newRole: ProjectRole) => {
    if (!project?.id) return;

    try {
      const projectRef = doc(db, 'projects', project.id);
      const updatedRoles = [...(project.requiredRoles || []), newRole];

      await updateDoc(projectRef, {
        requiredRoles: updatedRoles,
        updatedAt: new Date().toISOString()
      });

      setProject(prev => prev ? {
        ...prev,
        requiredRoles: updatedRoles
      } : null);

      toast.success('Role added successfully');
      setShowAddRoleModal(false);
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role');
    }
  };

  const handleInviteMember = async (email: string, roleTitle?: string) => {
    if (!project?.id) return;

    try {
      // Cek apakah user dengan email tersebut ada
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error('User not found');
        return;
      }

      const invitedUser = querySnapshot.docs[0];
      const invitedUserData = invitedUser.data();

      // Cek apakah user sudah menjadi member
      const isMember = project.members.some(member => member.id === invitedUser.id);
      if (isMember) {
        toast.error('User is already a member');
        return;
      }

      // Buat invitation
      const invitation = {
        projectId: project.id,
        projectTitle: project.title,
        projectOwnerId: project.owner.id,
        invitedUserId: invitedUser.id,
        invitedUserEmail: email,
        invitedUserName: invitedUserData.fullName || invitedUserData.displayName || 'User',
        role: roleTitle || null,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Simpan invitation ke Firestore
      await addDoc(collection(db, 'projectInvitations'), invitation);

      // Buat notifikasi untuk user yang diundang
      const notification = {
        userId: invitedUser.id,
        type: 'project_invitation',
        title: 'Project Invitation',
        message: `You have been invited to join project "${project.title}"`,
        data: {
          projectId: project.id,
          projectTitle: project.title
        },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'notifications'), notification);

      toast.success('Invitation sent successfully');
      setShowAddMemberModal(false);
      setInvitedEmail('');
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    }
  };

  // Add toggle function
  const toggleReplies = (threadId: string) => {
    setExpandedThreads(prev => 
      prev.includes(threadId) 
        ? prev.filter(id => id !== threadId)
        : [...prev, threadId]
    );
  };

  // Add character counter script
  useEffect(() => {
    const textarea = document.getElementById('content');
    const counter = document.getElementById('current-count');
    
    if (textarea && counter) {
      const updateCount = () => {
        const count = (textarea as HTMLTextAreaElement).value.length;
        counter.textContent = count.toString();
      };
      
      textarea.addEventListener('input', updateCount);
      return () => textarea.removeEventListener('input', updateCount);
    }
  }, [showNewThreadModal]);

  const handleMenuOpen = (event: React.MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Calculate position relative to viewport
    setMenuPosition({
      top: rect.bottom + scrollTop,
      left: rect.left + scrollLeft - 150 // Offset to the left
    });
  };

  // Add handleAssignUser function
  const handleAssignUser = async (assignedUsers: { id: string; name: string }[]) => {
    if (!selectedTaskId || !project?.id) return;

    try {
      const taskRef = doc(db, 'projectTasks', selectedTaskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        toast.error('Task not found');
        return;
      }

      // Get complete user data for each assigned user
      const assignedUsersData = await Promise.all(
        assignedUsers.map(async (user) => {
          const userDoc = await getDoc(doc(db, 'users', user.id));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          // Log untuk debugging
          console.log('User data from Firestore:', userData);
          
          const memberData = project.members.find(member => member.id === user.id);
          console.log('Member data from project:', memberData);

          return {
            id: user.id,
            name: userData?.fullName || userData?.displayName || user.name,
            avatar: userData?.avatar || userData?.photoURL || userData?.profileImage || memberData?.avatar || null,
            photoURL: userData?.photoURL || userData?.avatar || userData?.profileImage || memberData?.avatar || null,
            profileImage: userData?.profileImage || userData?.photoURL || userData?.avatar || memberData?.avatar || null,
            role: memberData?.role || null
          };
        })
      );

      // Log untuk debugging
      console.log('Final assigned users data:', assignedUsersData);

      await updateDoc(taskRef, {
        assignedUsers: assignedUsersData,
        updatedAt: new Date().toISOString()
      });

      // Add activity log
      const activity = {
        projectId: project.id,
        type: 'update',
        action: 'updated task assignments',
        target: taskDoc.data().title,
        user: {
          id: user?.uid,
          name: userData?.fullName || userData?.displayName || user?.displayName || 'Anonymous',
          avatar: userData?.avatar || userData?.photoURL || userData?.profileImage || user?.photoURL || null,
          photoURL: userData?.photoURL || userData?.avatar || userData?.profileImage || user?.photoURL || null,
          profileImage: userData?.profileImage || userData?.photoURL || userData?.avatar || user?.photoURL || null
        },
        timestamp: new Date().toISOString()
      };

      // Add to Firestore
      const activityRef = collection(db, 'projectActivities');
      await addDoc(activityRef, activity);

      toast.success('Users assigned successfully');
      setShowAssignUserModal(false);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error('Failed to assign users');
    }
  };

  // Add handleAssignRole function
  const handleAssignRole = async (taskId: string, assignedRoles: { id: string; title: string }[]) => {
    if (!project?.id) return;

    try {
      const taskRef = doc(db, 'projectTasks', taskId);
      await updateDoc(taskRef, {
        assignedRoles,
        updatedAt: new Date().toISOString()
      });

      toast.success('Roles assigned successfully');
      setShowAssignRoleModal(false);
      setSelectedTaskId(null);
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error('Failed to assign roles');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center border border-gray-200">
        <div className="text-4xl mb-4">😢</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600">
          The project you're looking for doesn't exist or has been removed
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Back Button - Mobile Only */}
      <div className="block sm:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          size="sm"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <Card className="overflow-hidden border border-gray-200">
      {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-30"></div>
          <div className="relative px-10 py-10 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Project Image */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative w-32 h-32"
              >
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full rounded-lg object-cover ring-2 ring-gray-200"
          />
        ) : (
          <div 
            className="w-full h-full rounded-lg flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100 ring-2 ring-gray-200"
          >
            🚀
          </div>
        )}
              </motion.div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
            <ProjectStatus status={getProjectDisplayStatus(project?.status)} />
                      <span className="text-sm text-gray-400">•</span>
                      <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
              {project.category}
            </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
              {project.phase} Phase
            </span>
          </div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{project.title}</h1>
                    <p className="text-base text-gray-600">{project.shortDescription}</p>
                </div>
                  <div className="flex flex-col sm:flex-row gap-3">
        {!hasProjectAccess && (
          <>
            {joinRequestStatus === 'pending' ? (
                          <Button disabled variant="outline" size="sm">
                Request Pending
              </Button>
            ) : joinRequestStatus === 'rejected' ? (
                          <Button disabled variant="outline" size="sm">
                Request Rejected
              </Button>
            ) : (
                          <Button onClick={() => setShowJoinModal(true)} variant="primary" size="sm">
                Join Project
              </Button>
            )}
          </>
        )}
                    <Button onClick={handleShare} variant="outline" size="sm">
          Share Project
        </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Content */}
        <div className="px-10 py-12 space-y-12">
          {/* About Project & Team Members */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* About Project - Takes up 3 columns */}
            <div className="lg:col-span-3">
              <Card className="h-full border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
                  <h2 className="text-base font-semibold text-gray-900">About Project</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{project.description}</p>
                </div>
              </Card>
            </div>

            {/* Team Members - Takes up 1 column */}
            <div className="lg:col-span-1">
              <Card className="h-full border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-3.5">
                  <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
                </div>
                <div className="px-6 py-5">
                  <div className="flex flex-col space-y-5">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-semibold text-gray-900">{project.members.length}</span>
                        <span className="text-gray-500 text-sm ml-2">members</span>
                      </div>
                    </div>
                    <div className="pl-1">
                      <div className="flex -space-x-2">
                        {/* Project Owner First */}
                        <div 
                          key={project.owner.id} 
                          className="w-7 h-7 rounded-full ring-2 ring-white overflow-hidden relative z-30"
                        >
                          {ownerData?.avatar ? (
                            <img 
                              src={ownerData.avatar} 
                              alt={ownerData.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerData.name)}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-700">
                                {ownerData?.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Other Members */}
                        {project.members
                          .filter(member => member.id !== project.owner.id)
                          .slice(0, 2)
                          .map((member, index) => (
                            <div 
                              key={member.id} 
                              className="w-7 h-7 rounded-full ring-2 ring-white overflow-hidden relative" 
                              style={{ zIndex: 2 - index }}
                            >
                              {member.avatar ? (
                                <img 
                                  src={member.avatar} 
                                  alt={member.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {member.name[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        {project.members.length > 3 && (
                          <div className="w-7 h-7 rounded-full ring-2 ring-white relative" style={{ zIndex: 0 }}>
                            <div className="absolute inset-0 bg-gray-100 opacity-60"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-800">+{project.members.length - 3}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
        </div>
      </div>

          {/* Tab Navigation */}
          <div className="hidden sm:block border-b border-gray-200">
            <nav className="flex gap-8" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('overview')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Overview
        </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'gallery'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Gallery
        </button>
        <button
          onClick={() => setActiveTab('team')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'team'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          Team
        </button>
        {hasProjectAccess && (
          <>
            <button
              onClick={() => setActiveTab('communication')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'communication'
                        ? 'text-primary-600 border-primary-600'
                        : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Communication
            </button>
            <button
              onClick={() => setActiveTab('resources')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'resources'
                        ? 'text-primary-600 border-primary-600'
                        : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                        ? 'text-primary-600 border-primary-600'
                        : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            {isProjectOwner && (
              <>
                <button
                  onClick={() => setActiveTab('activity')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'activity'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'settings'
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </>
        )}
            </nav>
      </div>

          {/* Mobile Tab Menu */}
          <div className="block sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-primary-500 py-2.5 px-4 text-sm"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
            >
              <option value="overview">Overview</option>
              <option value="gallery">Gallery</option>
              <option value="team">Team</option>
              {hasProjectAccess && (
                <>
                  <option value="communication">Communication</option>
                  <option value="resources">Resources</option>
                  <option value="tasks">Tasks</option>
                  {isProjectOwner && (
                    <>
                      <option value="activity">Activity</option>
                      <option value="settings">Settings</option>
                    </>
                  )}
                </>
              )}
            </select>
              </div>

          {/* Tab Content */}
          <div className="mt-8">
            {renderSpaceContent()}
              </div>
            </div>
          </Card>

      {/* Modals */}
      {showJoinModal && (
      <JoinProjectModal
        project={project}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmitRequest={handleJoinRequest}
      />
      )}

      {/* Add NewThreadModal */}
      <NewThreadModal 
        isOpen={showNewThreadModal}
        onClose={() => setShowNewThreadModal(false)}
        onSubmit={handleCreateThread}
      />

      {/* Add AssignRoleModal */}
      {showAssignRoleModal && selectedMemberForRole && (
        <AssignRoleModal
          isOpen={showAssignRoleModal}
          onClose={() => {
            setShowAssignRoleModal(false);
            setSelectedMemberForRole(null);
          }}
          onAssign={handleRoleAssignment}
          memberName={selectedMemberForRole.name}
          availableRoles={project?.requiredRoles || []}
        />
      )}

      {/* Add RoleModal */}
      <Dialog
        open={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Add New Role
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-500">
                Define a new role and its requirements for the project
              </p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const roleData = {
                id: Date.now().toString(),
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
                color: formData.get('color') as string || '#4F46E5',
                isRequired: true
              };
              handleAddRole(roleData);
            }}>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Role Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      placeholder="e.g. Frontend Developer"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      required
                      placeholder="Describe the responsibilities and expectations for this role"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                      Required Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="skills"
                      id="skills"
                      required
                      placeholder="e.g. React, TypeScript, Node.js"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate skills with commas</p>
                  </div>
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                      Role Color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        name="color"
                        id="color"
                        defaultValue="#4F46E5"
                        className="h-8 w-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">Choose a color for the role badge</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddRoleModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Role
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onInvite={handleInviteMember}
        availableRoles={project?.requiredRoles}
      />

      {/* Reply Modal */}
      <Dialog
        open={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setSelectedThreadForReply(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Reply to Discussion
              </Dialog.Title>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const content = formData.get('content') as string;
              if (content.trim() && selectedThreadForReply) {
                handleAddReply(selectedThreadForReply, content);
                setShowReplyModal(false);
                setSelectedThreadForReply(null);
                (e.target as HTMLFormElement).reset();
              }
            }}>
              <div className="p-6">
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Write your reply here..."
                    required
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedThreadForReply(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Submit Reply
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add NewTaskModal */}
      {showNewTaskModal && (
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleCreateTask}
          members={project?.members.map(member => ({
            ...member,
            photoURL: membersData[member.id]?.avatar || member.avatar,
            profileImage: membersData[member.id]?.avatar || member.avatar,
          }))}
        />
      )}

      {/* Assign User Modal */}
      {showAssignUserModal && selectedTaskId && (
        <AssignTaskModal
          isOpen={showAssignUserModal}
          onClose={() => {
            setShowAssignUserModal(false);
            setSelectedTaskId(null);
          }}
          onAssign={handleAssignUser}
          members={project.members.map(member => ({
            ...member,
            photoURL: membersData[member.id]?.avatar || member.avatar,
            profileImage: membersData[member.id]?.avatar || member.avatar,
          }))}
          currentAssignees={tasks.find(task => task.id === selectedTaskId)?.assignedUsers?.map(user => ({
            ...user,
            photoURL: user.photoURL || user.avatar || user.profileImage,
            profileImage: user.profileImage || user.photoURL || user.avatar,
            avatar: user.avatar || user.photoURL || user.profileImage,
          })) || []}
        />
      )}

      {/* Assign Role Modal */}
      {showAssignRoleModal && selectedTaskId && (
        <AssignRoleModal
          isOpen={showAssignRoleModal}
          onClose={() => {
            setShowAssignRoleModal(false);
            setSelectedTaskId(null);
          }}
          onAssign={handleAssignRole}
          taskId={selectedTaskId}
          availableRoles={tasks.find(task => task.id === selectedTaskId)?.assignedRoles || []}
        />
      )}
    </div>
  );
}