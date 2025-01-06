export interface RegistrationData {
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
  
  // Profile Picture
  profileImage?: string;
  profileEmoji?: string;
  profileColor?: string;
  
  // Professional Profile
  professionalTitle?: string;
  bio?: string;
  skills?: string[];
  experienceLevel?: string;
  yearsOfExperience?: number;
  
  // Interests & Preferences
  projectPreferences?: string[];
  collaborationStyles?: string[];
  languages?: string[];
  country?: string;
  timezone?: string; // Added missing timezone field
  weeklyAvailability?: number;
  
  // Notifications
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}