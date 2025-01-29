export interface User {
  id: string;
  fullName: string;
  bio: string;
  avatar?: string;
  skills: string[];
  availability: 'available' | 'busy' | 'unavailable';
  location: string;
  professionalTitle: string;
  experienceLevel: string;
  yearsOfExperience: number;
  languages: string[];
  collaborationStyles: string[];
  weeklyAvailability: number;
  socialLinks: Record<string, string>;
  stats: {
    projectsCount: number;
    followersCount: number;
    followingCount: number;
  };
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  bio?: string;
  professionalTitle?: string;
  country?: string;
  timezone?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  skills?: string[];
  languages?: string[];
  projectPreferences?: string[];
  collaborationPreferences?: string[];
  weeklyAvailability?: number;
  createdAt?: string;
  updatedAt?: string;
  profileColor?: string;
  profileEmoji?: string;
  // Notification settings
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  projectUpdates?: boolean;
  chatNotifications?: boolean;
  // Appearance settings
  darkMode?: boolean;
  language?: string;
  // Privacy settings
  profileVisibility?: 'public' | 'private';
  showOnlineStatus?: boolean;
  showActivity?: boolean;
  twoFactorEnabled?: boolean;
  theme?: 'light' | 'dark' | 'system';
}