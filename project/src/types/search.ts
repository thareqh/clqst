export interface SearchResult {
  id: string;
  type: 'project' | 'user';
  title: string;
  description: string;
  createdAt: string;
  tags?: string[];
  // Project specific fields
  coverImage?: string | null;
  status?: 'draft' | 'open' | 'in-progress' | 'completed';
  owner?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  members?: Array<{
    id: string;
    name: string;
    avatar?: string | null;
    role: string;
    joinedAt: string;
  }>;
  phase?: string;
  category?: string;
  visibility?: 'public' | 'private';
  requiredRoles?: Array<{
    title: string;
    description: string;
    skills: string[];
    isRequired: boolean;
  }>;
  // User specific fields
  avatar?: string | null;
  availability?: 'available' | 'busy';
  location?: string;
  professionalTitle?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  languages?: string[];
  collaborationStyles?: string[];
  weeklyAvailability?: number;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  stats?: {
    projectsCount: number;
    followersCount: number;
    followingCount: number;
  };
}