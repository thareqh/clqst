export interface User {
  id: string;
  fullName: string;
  email: string;
  professionalTitle?: string;
  bio?: string;
  country?: string;
  location?: string;
  avatar?: string;
  skills?: string[];
  projectPreferences?: string[];
  collaborationPreferences?: string[];
  languages?: string[];
  weeklyAvailability?: number;
  profileColor?: string;
  profileImage?: string;
  profileEmoji?: string;
  experienceLevel?: string;
  yearsOfExperience?: number;
  collaborationStyles?: string[];
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
  isPremium?: boolean;
}

export type UserProfile = Omit<User, 'id'> & {
  id?: string;
};