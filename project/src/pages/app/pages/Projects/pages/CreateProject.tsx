import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { FormInput } from '../../../../../components/auth/FormInput';
import { SearchableMultiSelect } from '../../../../../components/auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '../../../../../components/auth/registration/data/skills';
import { PROJECT_PHASES } from '../../../../../constants/projectPhases';
import { PROJECT_CATEGORIES } from '../../../../../constants/projectCategories';
import { useAuth } from '../../../../../contexts/AuthContext';
import { createProject } from '../../../../../services/projectService';
import { uploadProjectImage } from '../../../../../services/storageService';
import { ProjectImageUpload } from '../components/forms/ProjectImageUpload';
import { ProjectRoleInput } from '../components/forms/ProjectRoleInput';
import { ProjectCard } from '../../../../../components/projects/ProjectCard';
import { CategorySelect } from '../../../../../components/ui/CategorySelect';
import type { Project, ProjectRole } from '../../../../../types/project';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { InformationCircleIcon, CheckIcon } from '@heroicons/react/24/solid';
import { createSystemFolders } from '@/services/fileService';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';

interface Milestone {
  title: string;
  description: string;
  dueDate: string;
}

const TOOLTIPS = {
  title: "A clear, concise name that reflects your project's main purpose and helps others quickly understand what it's about",
  shortDescription: "A brief 160-character summary of your project that captures its essence and main value proposition",
  problemStatement: "Clearly describe the specific problem, challenge, or need that your project aims to address. What pain points or gaps does it solve?",
  expectedOutcomes: "Detail the tangible results and impacts your project will deliver. What specific changes or improvements will it bring? How will success be measured?",
  targetAudience: "Define who will benefit from your project. Include demographics, user personas, or stakeholder groups that will use or be impacted by your solution",
  projectGoals: "Long-term objectives that define what success looks like for your project. These should be specific, measurable, and aligned with solving the problem statement",
  milestones: "Key checkpoints or deliverables with specific deadlines that mark important progress in your project journey. Each milestone should bring you closer to your goals",
  description: "Comprehensive overview of your project including its features, functionality, and implementation approach. This is your chance to provide all the important details",
  skills: "Technical and non-technical competencies required to successfully complete the project. Be specific to help potential collaborators understand if they're a good fit",
  roles: "Specific positions or responsibilities needed in your project team. Define each role's requirements and contributions to help attract the right team members",
  category: "The primary domain or platform your project belongs to. This helps in proper categorization and discovery",
  phase: "Current stage of your project's development lifecycle. This helps set expectations and indicates what kind of help you need",
  websiteUrl: "Link to your project's live website, demo, or repository. This helps others see your progress and existing work"
};

const ROLE_COLORS = [
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Red', value: '#DC2626' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Yellow', value: '#CA8A04' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Cyan', value: '#0891B2' }
];

const STEPS = [
  {
    id: 'basics',
    title: 'Basic Information',
    description: 'Start with the fundamental details of your project'
  },
  {
    id: 'problem',
    title: 'Problem & Solution',
    description: 'Define the problem and how your project will solve it'
  },
  {
    id: 'planning',
    title: 'Goals & Milestones',
    description: 'Set clear objectives and timeline for your project'
  },
  {
    id: 'team',
    title: 'Team Requirements',
    description: 'Specify the skills and roles needed for your project'
  }
];

const TooltipContent = ({ content }: { content: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg z-50"
  >
    <div className="relative">
      {content}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
    </div>
  </motion.div>
);

export function CreateProject() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProjectCount, setUserProjectCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const checkUserProjects = async () => {
      if (!currentUser) return;

      try {
        // Query untuk proyek yang dimiliki user
        const projectsQuery = query(
          collection(db, 'projects'),
          where('owner.id', '==', currentUser.uid)
        );

        const snapshot = await getDocs(projectsQuery);
        setUserProjectCount(snapshot.size);
      } catch (error) {
        console.error('Error checking user projects:', error);
      }
    };

    checkUserProjects();
  }, [currentUser]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    phase: PROJECT_PHASES[0].id as "idea" | "planning" | "development" | "testing" | "launch",
    category: PROJECT_CATEGORIES[0].id as "web" | "mobile" | "desktop" | "other",
    websiteUrl: '',
    skills: [] as string[],
    coverImage: '',
    requiredRoles: [] as ProjectRole[],
    problemStatement: '',
    expectedOutcomes: '',
    targetAudience: '',
    projectGoals: [] as string[],
    milestones: [] as Milestone[]
  });

  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            Please log in and complete your profile to create a project
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate('/auth#login')}
            >
              Log In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Cek apakah user sudah mencapai batas proyek
  if (!(userProfile?.isPremium ?? false) && userProjectCount >= 3) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Batas Proyek Tercapai</h3>
          <p className="text-gray-600 mb-4">
            Anda telah mencapai batas maksimum 3 proyek untuk akun gratis. Upgrade ke Premium untuk membuat proyek tanpa batas.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate('/pricing')}
            >
              Upgrade ke Premium
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const [newRole, setNewRole] = useState<ProjectRole>({
    title: '',
    description: '',
    skills: [],
    isRequired: false,
    color: ROLE_COLORS[0].value
  });

  const handleImageSelect = async (file: File) => {
    try {
      const imageUrl = await uploadProjectImage(file);
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const phaseMapping: Record<typeof formData.phase, Project['phase']> = {
    'idea': 'idea',
    'planning': 'prototype',
    'development': 'development',
    'testing': 'growth',
    'launch': 'maintenance'
  };

  const getAvatarUrl = (profileImage: string | null | undefined): string | undefined => {
    if (typeof profileImage === 'string') return profileImage;
    return undefined;
  };

  const previewProject: Project = {
    id: 'preview',
    title: formData.title,
    description: formData.description,
    shortDescription: formData.shortDescription,
    coverImage: formData.coverImage,
    status: 'open',
    phase: phaseMapping[formData.phase],
    category: formData.category,
    skills: formData.skills,
    visibility: 'public',
    tags: [],
    requiredRoles: formData.requiredRoles,
    owner: {
      id: currentUser.uid,
      name: userProfile.fullName,
      avatar: getAvatarUrl(userProfile.profileImage)
    },
    members: [{
      id: currentUser.uid,
      name: userProfile.fullName,
      avatar: getAvatarUrl(userProfile.profileImage),
      role: 'owner',
      joinedAt: new Date().toISOString(),
      skills: formData.skills
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userProfile) return;

    if (!formData.title || !formData.shortDescription || !formData.description || 
        !formData.problemStatement || !formData.expectedOutcomes || !formData.targetAudience) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.skills.length === 0) {
      toast.error('Please select at least one required skill');
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setIsLoading(true);
    try {
      const { websiteUrl, ...restData } = formData;
      
      const memberData = {
        id: currentUser.uid,
        name: userProfile.fullName || '',
        avatar: userProfile.profileImage || null,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        skills: formData.skills || []
      };

      const projectData = {
        ...restData,
        status: 'open',
        visibility: 'public',
        tags: [],
        owner: {
          id: currentUser.uid,
          name: userProfile.fullName || '',
          avatar: userProfile.profileImage || null
        },
        members: [memberData],
        createdAt: new Date().toISOString(),
        problemStatement: formData.problemStatement,
        expectedOutcomes: formData.expectedOutcomes,
        targetAudience: formData.targetAudience,
        projectGoals: formData.projectGoals.filter(goal => goal.trim() !== ''),
        milestones: formData.milestones.filter(m => m.title.trim() !== '')
      };

      if (websiteUrl && websiteUrl.trim() !== '') {
        Object.assign(projectData, { websiteUrl: websiteUrl.trim() });
      }

      const projectRef = await addDoc(collection(db, 'projects'), projectData);

      const defaultChannels = [
        {
          name: 'general',
          type: 'text' as const,
          projectId: projectRef.id,
          createdAt: new Date().toISOString(),
          description: 'General discussion channel',
          members: [currentUser.uid]
        },
        {
          name: 'announcements',
          type: 'text' as const,
          projectId: projectRef.id,
          createdAt: new Date().toISOString(),
          description: 'Important announcements channel',
          members: [currentUser.uid]
        }
      ];

      await Promise.all(
        defaultChannels.map(channel =>
          addDoc(collection(db, 'channels'), channel)
        )
      );

      // Create system folders
      await createSystemFolders(
        projectRef.id,
        currentUser.uid,
        userProfile.fullName || 'Anonymous',
        userProfile.profileImage || undefined
      );

      toast.success('Project created successfully');
      navigate('/app/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (newRole.title && newRole.description) {
      setFormData(prev => ({
        ...prev,
        requiredRoles: [...prev.requiredRoles, { ...newRole }]
      }));
      setNewRole({
        title: '',
        description: '',
        skills: [],
        isRequired: false,
        color: ROLE_COLORS[0].value
      });
    }
  };

  const handleRemoveRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Project Image
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content="Upload a representative image for your project to make it stand out" />
                  </AnimatePresence>
                </div>
              </div>
              <ProjectImageUpload
                onImageSelect={handleImageSelect}
                currentImage={formData.coverImage}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Project Title
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.title} />
                  </AnimatePresence>
                </div>
              </div>
              <FormInput
                type="text"
                label=" "
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Enter a clear, descriptive title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm text-gray-600">Category</label>
                  <div className="group relative">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-4 h-4 text-gray-400 cursor-help"
                    >
                      <InformationCircleIcon />
                    </motion.div>
                    <AnimatePresence>
                      <TooltipContent content={TOOLTIPS.category} />
                    </AnimatePresence>
                  </div>
                </div>
                <CategorySelect
                  value={formData.category}
                  onChange={(category) => setFormData({ ...formData, category })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm text-gray-600">Phase</label>
                  <div className="group relative">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-4 h-4 text-gray-400 cursor-help"
                    >
                      <InformationCircleIcon />
                    </motion.div>
                    <AnimatePresence>
                      <TooltipContent content={TOOLTIPS.phase} />
                    </AnimatePresence>
                  </div>
                </div>
                <select
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value as "idea" | "planning" | "development" | "testing" | "launch" })}
                  className="w-full px-4 py-2 rounded-xl border"
                  required
                >
                  {PROJECT_PHASES.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Short Description
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.shortDescription} />
                  </AnimatePresence>
                </div>
              </div>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                placeholder="Brief overview of your project (max 160 characters)"
                maxLength={160}
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Website URL <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.websiteUrl} />
                  </AnimatePresence>
                </div>
              </div>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Problem Statement
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.problemStatement} />
                  </AnimatePresence>
                </div>
              </div>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                rows={4}
                placeholder="Describe the specific problem or challenge this project aims to solve"
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Expected Outcomes
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.expectedOutcomes} />
                  </AnimatePresence>
                </div>
              </div>
              <textarea
                value={formData.expectedOutcomes}
                onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                rows={4}
                placeholder="What are the expected results and impacts of this project?"
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Target Audience
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.targetAudience} />
                  </AnimatePresence>
                </div>
              </div>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                rows={3}
                placeholder="Who will benefit from this project? Describe your target users or stakeholders"
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Full Description
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.description} />
                  </AnimatePresence>
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border"
                rows={4}
                placeholder="Detailed description of your project"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Project Goals
                </label>
                <span className="text-gray-400 text-sm">(Optional)</span>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.projectGoals} />
                  </AnimatePresence>
                </div>
              </div>
              <div className="space-y-2">
                {formData.projectGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => {
                        const newGoals = [...formData.projectGoals];
                        newGoals[index] = e.target.value;
                        setFormData({ ...formData, projectGoals: newGoals });
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border"
                      placeholder="Enter a project goal"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newGoals = formData.projectGoals.filter((_, i) => i !== index);
                        setFormData({ ...formData, projectGoals: newGoals });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      projectGoals: [...formData.projectGoals, '']
                    });
                  }}
                >
                  Add Goal
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Milestones
                </label>
                <span className="text-gray-400 text-sm">(Optional)</span>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.milestones} />
                  </AnimatePresence>
                </div>
              </div>
              <div className="space-y-4">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => {
                          const newMilestones = [...formData.milestones];
                          newMilestones[index] = { ...milestone, title: e.target.value };
                          setFormData({ ...formData, milestones: newMilestones });
                        }}
                        className="flex-1 px-4 py-2 rounded-xl border"
                        placeholder="Milestone title"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newMilestones = formData.milestones.filter((_, i) => i !== index);
                          setFormData({ ...formData, milestones: newMilestones });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index] = { ...milestone, description: e.target.value };
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="w-full px-4 py-2 rounded-xl border"
                      placeholder="Describe this milestone"
                      rows={2}
                    />
                    <input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index] = { ...milestone, dueDate: e.target.value };
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="px-4 py-2 rounded-xl border"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      milestones: [...formData.milestones, { title: '', description: '', dueDate: '' }]
                    });
                  }}
                >
                  Add Milestone
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm text-gray-600">
                  Required Skills
                </label>
                <div className="group relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-4 h-4 text-gray-400 cursor-help"
                  >
                    <InformationCircleIcon />
                  </motion.div>
                  <AnimatePresence>
                    <TooltipContent content={TOOLTIPS.skills} />
                  </AnimatePresence>
                </div>
              </div>
              <SearchableMultiSelect
                label="Required Skills"
                options={SKILLS}
                value={formData.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                placeholder="Select required skills"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Roles</h2>
                  <div className="group relative">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-4 h-4 text-gray-400 cursor-help"
                    >
                      <InformationCircleIcon />
                    </motion.div>
                    <AnimatePresence>
                      <TooltipContent content={TOOLTIPS.roles} />
                    </AnimatePresence>
                  </div>
                </div>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              
              {formData.requiredRoles.map((role, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${role.color}15`,
                          color: role.color
                        }}
                      >
                        {role.title}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{role.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {role.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveRole(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Add New Role</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={newRole.title}
                      onChange={(e) => setNewRole({ ...newRole, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border"
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border"
                      placeholder="Describe the role's responsibilities..."
                      rows={3}
                    />
                  </div>

                  <SearchableMultiSelect
                    label="Required Skills"
                    options={SKILLS}
                    value={newRole.skills}
                    onChange={(skills) => setNewRole({ ...newRole, skills })}
                    placeholder="Select required skills for this role"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            newRole.color === color.value 
                              ? 'border-gray-900 scale-110' 
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewRole({ ...newRole, color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddRole}
                      disabled={!newRole.title || !newRole.description}
                    >
                      Add Role
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.shortDescription && formData.coverImage;
      case 1:
        return formData.problemStatement && formData.expectedOutcomes && 
               formData.targetAudience && formData.description;
      case 2:
        return true; // Goals and milestones are optional
      case 3:
        return formData.skills.length > 0; // At least one skill is required
      default:
        return false;
    }
  };

  return (
    <>
      <div className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
            <p className="mt-1 text-sm text-gray-500">Fill in the details to create your new project</p>
          </div>
        </div>

        <Card className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            <div className="w-full grid grid-cols-4 gap-4">
              {STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className="relative"
                >
                  <div className="flex flex-col items-center relative">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-all duration-300 ${
                        index <= currentStep - 1
                          ? 'bg-white border-primary-500 text-gray-900' 
                          : index === currentStep 
                            ? 'bg-white text-primary-500 border-primary-500' 
                            : 'bg-white text-gray-400 border-gray-200'
                      }`}
                    >
                      {index <= currentStep - 1 ? (
                        <span className="text-base leading-none">✓</span>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-3 text-sm font-medium text-center text-gray-900 whitespace-nowrap">{step.title}</div>
                    <div className="mt-1 text-xs text-center text-gray-500 max-w-[140px] mx-auto">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => navigate('/app/projects')}
                disabled={isLoading}
              >
                Cancel
              </Button>

              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={() => isStepValid() && setCurrentStep(currentStep + 1)}
                  disabled={!isStepValid()}
                >
                  Next
                </Button>
              ) : (
              <Button
                type="submit"
                loading={isLoading}
                  disabled={!isStepValid()}
              >
                Create Project
              </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <Dialog
            as={motion.div}
            static
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            open={showPreview}
            onClose={() => setShowPreview(false)}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4">
              <Dialog.Overlay 
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30" 
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto p-8"
              >
                <Dialog.Title className="text-2xl font-semibold text-gray-900 mb-6">
                  Preview Your Project
                </Dialog.Title>

                <div className="mb-8">
                  <ProjectCard project={previewProject} />
                </div>

                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                    disabled={isLoading}
                  >
                    Back to Edit
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmSubmit}
                    loading={isLoading}
                  >
                    Create Project
                  </Button>
                </div>
              </motion.div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}