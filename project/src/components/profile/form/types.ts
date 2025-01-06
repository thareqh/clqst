import type { CollaborationType } from '../../../constants/collaboration';

export interface ProfileFormData {
  fullName: string;
  professionalTitle: string;
  bio: string;
  skills: string[];
  projectPreferences: string[];
  collaborationPreferences: CollaborationType[];
  languages: string[];
  country: string;
  weeklyAvailability: number;
}