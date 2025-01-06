import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { ProfileFormData } from './types';

export function useProfileForm(onComplete: () => Promise<void>) {
  const { userProfile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    fullName: userProfile?.fullName || '',
    professionalTitle: userProfile?.professionalTitle || '',
    bio: userProfile?.bio || '',
    skills: userProfile?.skills || [],
    projectPreferences: userProfile?.projectPreferences || [],
    collaborationPreferences: userProfile?.collaborationPreferences?.map(pref => 
      pref as 'Remote' | 'Hybrid' | 'On-site'
    ) || [],
    languages: userProfile?.languages || [],
    country: userProfile?.country || '',
    weeklyAvailability: userProfile?.weeklyAvailability || 40
  }));

  // Update local form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        professionalTitle: userProfile.professionalTitle || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || [],
        projectPreferences: userProfile.projectPreferences || [],
        collaborationPreferences: userProfile.collaborationPreferences?.map(pref => 
          pref as 'Remote' | 'Hybrid' | 'On-site'
        ) || [],
        languages: userProfile.languages || [],
        country: userProfile.country || '',
        weeklyAvailability: userProfile.weeklyAvailability || 40
      });
    }
  }, [userProfile]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Submitting form data:', formData);
      await updateProfile(formData);
      console.log('Form submitted successfully');
      await onComplete();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, updateProfile, onComplete]);

  return {
    formData,
    setFormData,
    isLoading,
    handleSubmit
  };
}