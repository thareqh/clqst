export type ProjectCategory = 
  | 'web' 
  | 'mobile' 
  | 'desktop'
  | 'backend'
  | 'api'
  | 'ai'
  | 'data'
  | 'blockchain'
  | 'game'
  | 'iot'
  | 'devops'
  | 'security'
  | 'ar_vr'
  | 'ecommerce'
  | 'education'
  | 'productivity'
  | 'social'
  | 'other';

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
  avatar?: string;
  role: string;
  skills: string[];
  joinedAt: string;
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
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  problem: string;
  solution: string;
  coverImage?: string;
  status: 'open' | 'closed' | 'completed' | 'archived';
  skills: string[];
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: ProjectMember[];
  phase: 'idea' | 'prototype' | 'development' | 'growth' | 'maintenance';
  category: 'web' | 'mobile' | 'desktop' | 'backend' | 'ai' | 'data' | 'blockchain' | 
           'game' | 'iot' | 'robotics' | 'cloud' | 'security' | 'ar_vr' | 'network' | 
           'embedded' | 'research' | 'education' | 'business' | 'finance' | 'healthcare' |
           'art' | 'music' | 'photo' | 'video' | 'commerce' | 'innovation' | 'social' |
           'creative' | 'other';
  visibility: 'public' | 'private';
  tags: string[];
  requiredRoles: ProjectRole[];
  milestones: ProjectMilestone[];
  images?: Array<{
    url: string;
    caption?: string;
  }>;
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
  userId: string;
  projectOwnerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    name: string;
    avatar?: string;
  };
  role?: {
    title: string;
    color?: string;
  };
  read?: boolean;
  readAt?: Date;
  attachments?: ProjectAttachment[];
}