import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProject } from '@/services/projectService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProjectStatus } from '@/components/projects/ProjectStatus';
import { ProjectSkills } from '@/components/projects/ProjectSkills';
import { JoinProjectModal } from './components/JoinProjectModal';
import type { Project, ProjectRole, ProjectMilestone } from '@/types/project';
import { doc, getDoc, addDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatBytes } from '@/utils/formatBytes';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { JoinRequestNotification } from '../../components/JoinRequestNotification';
import type { ProjectJoinRequest } from '@/types/project';
import { CommunicationHub } from '../../components/communication/CommunicationHub';
import { ThreadView } from '../../components/communication/ThreadView';
import { ProjectTasks } from './components/ProjectTasks';
import { ResourcesTab } from '@/pages/app/pages/Projects/components/FileManager';
import { EditProjectModal } from '@/pages/app/pages/Projects/components/modals/EditProjectModal';
import { RoleModal } from '@/pages/app/pages/Projects/components/modals/RoleModal';
import { MilestoneModal } from '@/pages/app/pages/Projects/components/modals/MilestoneModal';
import { EditSkillsModal } from '@/pages/app/pages/Projects/components/modals/EditSkillsModal';
import { Firestore } from 'firebase/firestore';

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

type SpaceTab = 
  | 'overview' 
  | 'team' 
  | 'communication' 
  | 'resources' 
  | 'tasks'
  | 'timeline'
  | 'analytics'
  | 'settings';

type ResourceSection = 
  | 'files';

// Type definition untuk project status
type ProjectStatus = 'open' | 'closed' | 'completed' | 'archived';

// Fungsi helper untuk menentukan status proyek
const getProjectDisplayStatus = (status: ProjectStatus | undefined): 'open' | 'closed' | 'completed' => {
  if (!status) return 'completed';
  
  if (status === 'open') return 'open';
  if (status === 'closed' || status === 'archived') return 'closed';
  return 'completed';
};

export function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<SpaceTab>('overview');
  const [activeResourceSection, setActiveResourceSection] = useState<ResourceSection>('files');
  const [ownerData, setOwnerData] = useState<{ id: string; name: string; avatar: string | null } | null>(null);
  const [membersData, setMembersData] = useState<MembersDataMap>({});
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    limit: MEMBERSHIP_TIERS.free.storageLimit,
    files: 0
  });
  const [joinRequests, setJoinRequests] = useState<ProjectJoinRequest[]>([]);
  const [joinRequestStatus, setJoinRequestStatus] = useState<'none' | 'pending' | 'rejected'>('none');
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ProjectRole | undefined>();
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showEditSkillsModal, setShowEditSkillsModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | undefined>();
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState<{id: string; name: string} | null>(null);

  const isProjectMember = Boolean(project?.members.some(member => member.id === user?.uid));
  const isProjectOwner = Boolean(project?.owner.id === user?.uid);
  const hasProjectAccess = isProjectMember || isProjectOwner;

  // Fungsi untuk menghitung persentase penggunaan storage
  const storageUsagePercent = (storageInfo.used / storageInfo.limit) * 100;
  const isStorageFull = storageInfo.used >= storageInfo.limit;

  // Perbaikan untuk perbandingan status
  const canDeleteProject = project?.status && (project.status as ProjectStatus) !== 'closed';

  // Fetch owner data
  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!project?.owner?.id) return;
      
      try {
        const ownerDoc = await getDoc(doc(db, 'users', project.owner.id));
        if (ownerDoc.exists()) {
          const data = ownerDoc.data();
          setOwnerData({
            id: project.owner.id,
            name: data.fullName || project.owner.name || 'Unknown User',
            avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || data.photo || null,
          });
        }
      } catch (error) {
        console.error('Error fetching owner data:', error);
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
                name: data.fullName || member.name,
                avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || null
              }
            };
          }
          return {
            [member.id]: { name: member.name, avatar: member.avatar }
          };
        });

        // Get data for join requests
        const requestPromises = joinRequests.map(async (request) => {
          const userDoc = await getDoc(doc(db, 'users', request.userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            return {
              [request.userId]: {
                name: data.fullName || request.user.name,
                avatar: data.photoURL || data.avatar || data.profilePicture || data.profileImage || null
              }
            };
          }
          return {
            [request.userId]: { name: request.user.name, avatar: request.user.avatar }
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

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const projectData = await getProject(id);
        console.log('Project data:', projectData); // Debug log
        setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

    loadProject();
  }, [id]);

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

  const renderPreviewTabs = () => {
    if (!hasProjectAccess) {
      // Non-member view
      return (
      <div className="flex gap-8 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
            onClick={() => setActiveTab('team')}
          className={`pb-4 text-sm font-medium ${
              activeTab === 'team'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
            Team
          </button>
        </div>
      );
    }

    // Member view (original tabs)
    return (
      <div className="flex gap-8 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'overview'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'team'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Team
        </button>
        <button
          onClick={() => setActiveTab('communication')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'communication'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Communication
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'resources'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-4 text-sm font-medium ${
            activeTab === 'tasks'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tasks
        </button>
        {isProjectOwner && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 text-sm font-medium ${
              activeTab === 'settings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        )}
      </div>
    );
  };

  const renderSpaceContent = () => {
    if (!id || !project) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* About Project */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">About Project</h2>
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600">{project?.description}</p>
                  </div>
              </div>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Problem & Solution */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden h-full">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Problem & Solution</h2>
                  </div>
              <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Problem Statement</h3>
                        <p className="text-gray-600">{project?.problemStatement}</p>
                          </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Expected Outcomes</h3>
                        <p className="text-gray-600">{project?.expectedOutcomes}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Target Audience</h3>
                        <p className="text-gray-600">{project?.targetAudience}</p>
                    </div>
                </div>
                </div>
              </Card>
              </div>

              {/* Right Column - Project Skills */}
              <div>
                <Card className="overflow-hidden h-full">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Project Skills</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {project?.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Project Goals & Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Goals */}
              <Card className="overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Project Goals</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {project?.projectGoals?.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <p className="text-gray-600">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Project Timeline */}
              <Card className="overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Project Timeline</h2>
                </div>
                <div className="p-6">
                  {project?.milestones && project.milestones.length > 0 ? (
                    <div className="relative">
                      <div className="absolute top-0 bottom-0 left-4 border-l-2 border-gray-100" />
                      <div className="space-y-6">
                        {project.milestones.map((milestone, index) => (
                          <div key={index} className="relative pl-10">
                            <div className="absolute left-[14px] top-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">{milestone.title}</h3>
                                <p className="mt-1 text-sm text-gray-600">{milestone.description}</p>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(milestone.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">No milestones have been set for this project</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Open Positions */}
            {project?.requiredRoles && project.requiredRoles.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.requiredRoles.map((role, index) => (
                      <div key={index} className="border border-gray-100 rounded-lg p-4">
                        <div 
                          className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2"
                          style={{ 
                            backgroundColor: `${role.color}15`,
                            color: role.color
                          }}
                        >
                          {role.title}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                        {role.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {role.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Discussions</h2>
              </div>
              <div className="p-0">
                <ThreadView projectId={id} />
              </div>
            </Card>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">File Management</h2>
              </div>
              <div className="p-6">
                <ResourcesTab projectId={id} />
              </div>
            </Card>
          </div>
        );

      case 'tasks':
        return (
          <ProjectTasks
            projectId={id!}
            isProjectOwner={isProjectOwner}
            isProjectMember={isProjectMember}
          />
        );

      case 'timeline':
        return (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Project Timeline</h2>
                <Button variant="primary">Add Milestone</Button>
              </div>
              <div className="text-gray-600 text-center py-8">
                No milestones set
              </div>
            </div>
          </Card>
        );

      case 'analytics':
        return (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Project Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Task Progress</h3>
                  <div className="text-gray-600 text-center py-8">
                    No data available
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Team Activity</h3>
                  <div className="text-gray-600 text-center py-8">
                    No data available
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Project Settings</h2>
                <p className="mt-1 text-sm text-gray-500">Manage your project information and settings</p>
              </div>
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Project
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Project Information Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Title</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.title}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Category</h4>
                      <p className="mt-2 text-sm text-gray-900 capitalize">{project.category}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Phase</h4>
                      <p className="mt-2 text-sm text-gray-900 capitalize">{project.phase}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <div className="mt-2">
                        <ProjectStatus status={getProjectDisplayStatus(project?.status)} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Visibility</h4>
                      <p className="mt-2 text-sm text-gray-900 capitalize">{project.visibility}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Created</h4>
                      <p className="mt-2 text-sm text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Project Description Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Description</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Short Description</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.shortDescription}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Full Description</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.description}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Goals & Outcomes Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Goals & Outcomes</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Problem Statement</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.problemStatement}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Expected Outcomes</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.expectedOutcomes}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Target Audience</h4>
                      <p className="mt-2 text-sm text-gray-900">{project.targetAudience}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Project Goals Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900">Project Goals</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {project.projectGoals?.map((goal, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-50 text-primary-600 text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-900">{goal}</p>
                      </div>
                    ))}
                    {(!project.projectGoals || project.projectGoals.length === 0) && (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">🎯</div>
                        <p className="text-sm text-gray-500">No project goals defined</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Project Timeline Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage project milestones and timeline</p>
                  </div>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddMilestoneModal(true)}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Milestone
                  </Button>
                </div>
                <div className="p-6">
                  {project.milestones?.length > 0 ? (
                    <div className="space-y-4">
                      {project.milestones.map((milestone, index) => (
                        <div 
                          key={index}
                          className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                              <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                              <div className="mt-2 text-xs text-gray-500">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMilestone(milestone)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMilestone(milestone)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-4">📅</div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No milestones defined</h3>
                      <p className="text-sm text-gray-500 mb-4">Get started by adding a milestone to your project</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddMilestoneModal(true)}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add First Milestone
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Project Skills Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Project Skills</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage required skills for the project</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditSkillsModal(true)}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Skills
                  </Button>
                </div>
                <div className="p-6">
                  {project.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-4xl mb-4">⚡</div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No skills defined</h3>
                      <p className="text-sm text-gray-500 mb-4">Add skills that are required for this project</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditSkillsModal(true)}
                        className="flex items-center gap-2 mx-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Skills
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Role Management Card */}
              <Card>
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage project roles and requirements</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddRoleModal(true)}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Role
                  </Button>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {project.requiredRoles?.map((role, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span 
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: role.color }}
                              />
                              <h4 className="text-sm font-medium text-gray-900">{role.title}</h4>
                              {role.isRequired && (
                                <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{role.description}</p>
                            {role.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {role.skills.map((skill, skillIndex) => (
                                  <span 
                                    key={skillIndex}
                                    className="px-2 py-0.5 text-xs text-gray-600 bg-gray-50 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRole(role)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!project.requiredRoles || project.requiredRoles.length === 0) && (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">👥</div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No roles defined</h3>
                        <p className="text-sm text-gray-500 mb-4">Get started by adding a role to your project</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddRoleModal(true)}
                          className="flex items-center gap-2 mx-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add First Role
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Project Deletion Card */}
              {isProjectOwner && (
                <Card>
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
                      <p className="mt-1 text-sm text-gray-500">Permanently delete this project and all of its contents</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 mt-0.5">⚠️</div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-700">Delete Project</h4>
                          <p className="mt-1 text-sm text-red-600">
                            Once you delete a project, there is no going back. Please be certain.
                          </p>
                          <div className="mt-4">
                            <Button
                              onClick={() => setShowDeleteConfirmModal(true)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Project
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 'team':
        return (
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-medium mb-6">Manage Team</h3>
              
              {/* Project Owner */}
              <div className="p-6 bg-primary-50 rounded-lg mb-8">
                <div className="flex items-center gap-4">
                  {ownerData?.avatar ? (
                    <img
                      src={ownerData.avatar}
                      alt={ownerData.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-xl text-primary-700">
                        {(ownerData?.name || project?.owner?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{ownerData?.name || project?.owner?.name || 'Unknown User'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        Project Owner
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Since {new Date(project?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* All Team Members */}
              <div className="mb-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-500">All Team Members</h3>
                  <span className="text-xs text-gray-400">{(project?.members.filter(member => member.id !== project.owner.id).length || 0)} members</span>
                </div>
                
                <div className="mt-4 space-y-4">
                  {project?.members
                    .filter(member => member.id !== project.owner.id) // Filter out the owner
                    .map((member) => {
                    const memberData = membersData[member.id];
                    return (
                      <div
                        key={member.id}
                        className="p-4 border border-gray-100 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {memberData?.avatar ? (
                              <img
                                src={memberData.avatar}
                                alt={memberData.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <span className="text-lg text-primary-700">
                                  {(memberData?.name || member.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium">{memberData?.name || member.name}</h3>
                              {member.role && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                    {member.role}
                                  </span>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {isProjectOwner && member.id !== project?.owner.id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedMemberToRemove({
                                  id: member.id,
                                  name: memberData?.name || member.name
                                });
                                setShowRemoveMemberModal(true);
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Roles */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="text-sm font-medium text-gray-500">Team Roles</h3>
                  <span className="text-xs text-gray-400">{project?.requiredRoles.length || 0} roles</span>
                </div>
                
                {project?.requiredRoles.map((role) => {
                  const membersWithRole = project.members
                    .filter(member => member.role === role.title && member.id !== project.owner.id);

                  return (
                    <div key={role.title} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{role.title}</h4>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                        {role.isRequired && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            Required
                          </span>
                        )}
                      </div>

                      {membersWithRole.length > 0 ? (
                        membersWithRole.map((member) => {
                          const memberData = membersData[member.id];
                          return (
                            <div
                              key={member.id}
                              className="p-4 border border-gray-100 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {memberData?.avatar ? (
                                    <img
                                      src={memberData.avatar}
                                      alt={memberData.name}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                      <span className="text-lg text-primary-700">
                                        {(memberData?.name || member.name || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-medium">{memberData?.name || member.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span
                                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                                        style={{
                                          backgroundColor: role.color ? `${role.color}20` : undefined,
                                          color: role.color || undefined
                                        }}
                                      >
                                        {member.role}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                {isProjectOwner && (
                                  <Button variant="outline" size="sm">Remove</Button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 border border-dashed border-gray-200 rounded-lg">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">No members assigned to this role</p>
                            {isProjectOwner && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mt-2"
                              >
                                Assign Member
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
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

      const latestRequest = requests[0];
      if (latestRequest) {
        if (latestRequest.status === 'pending') {
          setJoinRequestStatus('pending');
        } else if (latestRequest.status === 'rejected') {
          setJoinRequestStatus('rejected');
        }
      } else {
        setJoinRequestStatus('none');
      }
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
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">😢</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <p className="text-gray-600">
          The project you're looking for doesn't exist or has been removed
        </p>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-80 rounded-xl overflow-hidden mb-8">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-6xl">🎯</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Project Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <ProjectStatus status={getProjectDisplayStatus(project?.status)} />
            <span className="text-sm">•</span>
            <span className="px-3 py-1 text-xs backdrop-blur-xl bg-white/20 border border-white/20 text-white rounded-full capitalize">
              {project.category}
            </span>
            <span className="text-sm">•</span>
            <span className="px-3 py-1 text-xs backdrop-blur-xl bg-white/20 border border-white/20 text-white rounded-full capitalize">
              {project.phase} Phase
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
          <p className="text-lg text-gray-100 mb-4">{project.shortDescription}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {ownerData?.avatar ? (
                <img
                  src={ownerData.avatar}
                  alt={ownerData.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-sm text-white">
                    {(ownerData?.name || project?.owner?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm">Created by {ownerData?.name || project?.owner?.name || 'Unknown User'}</span>
            </div>
            <span className="text-sm">•</span>
            <span className="text-sm">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        {!hasProjectAccess && (
          <>
            {joinRequestStatus === 'pending' ? (
              <Button disabled variant="outline">
                Request Pending
              </Button>
            ) : joinRequestStatus === 'rejected' ? (
              <Button disabled variant="outline">
                Request Rejected
              </Button>
            ) : (
          <Button onClick={() => setShowJoinModal(true)} variant="primary">
                Join Project
              </Button>
            )}
          </>
        )}
        <Button onClick={handleShare} variant="outline">
                Share Project
              </Button>
            </div>

      {/* Join Requests Section */}
      {renderJoinRequests()}

      {/* Navigation Tabs */}
      {hasProjectAccess ? renderPreviewTabs() : renderPreviewTabs()}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {renderSpaceContent()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="font-medium mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium capitalize">{project.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phase</p>
                  <p className="font-medium capitalize">{project.phase}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-medium capitalize">{project.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Visibility</p>
                  <p className="font-medium capitalize">{project.visibility}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {project.websiteUrl && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Website</p>
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 break-all"
                    >
                      {project.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Project Stats</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Team Members</h3>
                  <span className="text-xs text-gray-500">{project?.members.length} members</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                  {project?.members.slice(0, 5).map((member, index) => {
                    const memberData = membersData[member.id];
                    return (
                      <div key={member.id} className="relative" title={memberData?.name || member.name}>
                        {memberData?.avatar ? (
                          <img
                            src={memberData.avatar}
                            alt={memberData.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center">
                            <span className="text-sm text-primary-700">
                              {(memberData?.name || member.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {project?.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{project.members.length - 5}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Phase */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Project Phase</h3>
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full capitalize">
                    {project?.phase}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${
                          project?.phase === 'idea' ? 20 :
                          project?.phase === 'prototype' ? 40 :
                          project?.phase === 'development' ? 60 :
                          project?.phase === 'growth' ? 80 :
                          project?.phase === 'maintenance' ? 100 : 0
                        }%` 
                      }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 border ${project?.phase === 'idea' ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-200'}`} />
                      <span className="text-[10px] leading-tight text-gray-600 block">Idea</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 border ${project?.phase === 'prototype' ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-200'}`} />
                      <span className="text-[10px] leading-tight text-gray-600 block">Proto</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 border ${project?.phase === 'development' ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-200'}`} />
                      <span className="text-[10px] leading-tight text-gray-600 block">Dev</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 border ${project?.phase === 'growth' ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-200'}`} />
                      <span className="text-[10px] leading-tight text-gray-600 block">Growth</span>
                    </div>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-2 border ${project?.phase === 'maintenance' ? 'bg-primary-500 border-primary-500' : 'bg-gray-100 border-gray-200'}`} />
                      <span className="text-[10px] leading-tight text-gray-600 block">Maint</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-primary-600">
                      {project?.skills?.length || 0}
                    </span>
                    <span className="text-sm text-gray-600 mt-1">Project Skills</span>
                </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-primary-600">
                      {project?.milestones?.length || 0}
                    </span>
                    <span className="text-sm text-gray-600 mt-1">Milestones</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showJoinModal && (
      <JoinProjectModal
        project={project}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmitRequest={handleJoinRequest}
      />
      )}

      {/* Modals */}
      {isEditModalOpen && project && (
        <EditProjectModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updatedProject: Project) => {
            setProject(updatedProject);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* Role Modals */}
      {showAddRoleModal && (
        <RoleModal
          project={project}
          isOpen={showAddRoleModal}
          onClose={() => setShowAddRoleModal(false)}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            setShowAddRoleModal(false);
          }}
        />
      )}

      {showEditRoleModal && selectedRole && (
        <RoleModal
          project={project}
          role={selectedRole}
          isOpen={showEditRoleModal}
          onClose={() => {
            setShowEditRoleModal(false);
            setSelectedRole(undefined);
          }}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            setShowEditRoleModal(false);
            setSelectedRole(undefined);
          }}
        />
      )}

      {/* Milestone Modals */}
      {showAddMilestoneModal && (
        <MilestoneModal
          project={project}
          isOpen={showAddMilestoneModal}
          onClose={() => setShowAddMilestoneModal(false)}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            setShowAddMilestoneModal(false);
          }}
        />
      )}

      {showEditMilestoneModal && selectedMilestone && (
        <MilestoneModal
          project={project}
          milestone={selectedMilestone}
          isOpen={showEditMilestoneModal}
          onClose={() => {
            setShowEditMilestoneModal(false);
            setSelectedMilestone(undefined);
          }}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            setShowEditMilestoneModal(false);
            setSelectedMilestone(undefined);
          }}
        />
      )}

      {/* Skills Modal */}
      {showEditSkillsModal && (
        <EditSkillsModal
          project={project}
          isOpen={showEditSkillsModal}
          onClose={() => setShowEditSkillsModal(false)}
          onUpdate={(updatedProject) => {
            setProject(updatedProject);
            setShowEditSkillsModal(false);
          }}
        />
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <span className="text-4xl">⚠️</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this project? This action cannot be undone and will permanently delete:
                <ul className="mt-2 list-disc list-inside">
                  <li>All project files and resources</li>
                  <li>All messages and communications</li>
                  <li>All tasks and milestones</li>
                  <li>All team member associations</li>
                </ul>
              </p>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Please type <span className="font-medium text-gray-900">{project?.title}</span> to confirm.
                </div>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type project name here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    setDeleteConfirmText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={deleteConfirmText !== project?.title}
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveMemberModal && selectedMemberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Team Member</h3>
                <p className="mt-1 text-sm text-gray-500">This action cannot be undone</p>
              </div>
              <button
                onClick={() => {
                  setShowRemoveMemberModal(false);
                  setSelectedMemberToRemove(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-2">
                      You are about to remove <span className="text-red-600">{selectedMemberToRemove.name}</span> from this project
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Their access to project resources will be revoked immediately</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">All role assignments will be removed</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-600">Their messages and contributions will be preserved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemoveMemberModal(false);
                    setSelectedMemberToRemove(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemoveMember}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Remove Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}