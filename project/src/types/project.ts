export interface ProjectCategory {
  id: string;
  name: string;
  icon: string;
}

export interface ProjectRole {
  title: string;
  description: string;
  color: string;
  isRequired: boolean;
  skills: string[];
}

export interface ProjectMember {
  id: string;
  name: string;
  avatar?: string | null;
  role: string;
  joinedAt: string;
  skills: string[];
}

export interface ProjectOwner {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface ProjectMilestone {
  title: string;
  description: string;
  dueDate: string;
}

export interface Project {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'other';
  phase: 'idea' | 'prototype' | 'development' | 'growth' | 'maintenance';
  status: 'open' | 'closed' | 'completed';
  visibility: 'public' | 'private';
  websiteUrl?: string;
  coverImage?: string;
  problemStatement: string;
  expectedOutcomes: string;
  targetAudience: string;
  projectGoals: string[];
  requiredRoles: ProjectRole[];
  skills: string[];
  members: ProjectMember[];
  owner: {
    id: string;
    name: string;
    avatar: string | null;
  };
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAttachment {
  name: string;
  url: string;
  size: number;
}

export interface ProjectJoinRequest {
  id: string;
  projectId: string;
  projectOwnerId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  role: ProjectRole | null;
  message: string;
  attachments: ProjectAttachment[];
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}