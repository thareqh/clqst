import { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ProfileForm } from '../../../../components/profile/ProfileForm';
import { ProfilePictureModal } from '../../../../components/profile/picture/ProfilePictureModal';
import { CountryDisplay } from '../../../../components/auth/registration/inputs/CountryDisplay';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import type { User } from '../../../../types/user';
import type { Project } from '../../../../types/project';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const { currentUser: user, userProfile, refreshUserProfile } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.uid) return;

      try {
        console.log('Fetching projects for user:', user.uid);
        // Fetch all projects (owned and joined)
        const [ownedSnapshot, joinedSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'projects'), where('owner.id', '==', user.uid))),
          getDocs(query(collection(db, 'projects'), where('members', 'array-contains', { id: user.uid })))
        ]);

        const ownedProjects = ownedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        const joinedProjects = joinedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() })) as Project[];

        // Combine and remove duplicates
        const allProjects = [...ownedProjects, ...joinedProjects.filter(project => project.owner.id !== user.uid)];
        const uniqueProjects = Array.from(new Map(allProjects.map(project => [project.id, project])).values());
        
        console.log('Projects loaded:', uniqueProjects.length);
        setOwnedProjects(uniqueProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  const handleEditSuccess = async () => {
    console.log('Profile edit successful, refreshing data...');
    await refreshUserProfile();
    setIsEditing(false);
  };

  const handlePictureModalClose = () => {
    setIsEditingPicture(false);
  };

  if (!userProfile) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">
            Your profile is not available or has been removed
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-8 pb-4 sm:pb-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => setIsEditingPicture(true)}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                {userProfile.avatar || userProfile.profileImage ? (
                  <img
                    src={userProfile.avatar || userProfile.profileImage}
                    alt={userProfile.fullName}
                    className="w-full h-full rounded-full object-cover ring-4 ring-gray-50"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl ring-4 ring-gray-50"
                    style={{ backgroundColor: userProfile.profileColor || '#f3f4f6' }}
                  >
                    {userProfile.profileEmoji || userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">Change Photo</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold mb-2">{userProfile.fullName}</h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-4">{userProfile.professionalTitle}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-6">
                    {userProfile.country && (
                      <div className="flex items-center gap-2">
                        <CountryDisplay country={userProfile.country} />
                      </div>
                    )}
                    {userProfile.experienceLevel && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <span className="text-sm">
                          {userProfile.experienceLevel} experience
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant={isEditing ? 'outline' : 'primary'}
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-shrink-0 w-full sm:w-auto"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="p-4 sm:p-8">
            <ProfileForm 
              onCancel={() => setIsEditing(false)}
              onSuccess={handleEditSuccess}
            />
          </div>
        ) : (
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Basic Information</h3>
              <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
                {userProfile.bio && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <div className="text-sm sm:text-base text-gray-600 leading-relaxed">{userProfile.bio}</div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {userProfile.yearsOfExperience && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                      <div className="text-sm sm:text-base text-gray-600">{userProfile.yearsOfExperience} years</div>
                    </div>
                  )}
                  {userProfile.timezone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <div className="text-sm sm:text-base text-gray-600">{userProfile.timezone}</div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Skills & Preferences */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Skills & Preferences</h3>
              <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
                {userProfile.skills && userProfile.skills.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white shadow-sm border border-gray-200 rounded-full text-xs sm:text-sm font-medium text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile.projectPreferences && userProfile.projectPreferences.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Project Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.projectPreferences.map((pref: string) => (
                        <span
                          key={pref}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile.languages && userProfile.languages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.languages.map((lang: string) => (
                        <span
                          key={lang}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile.collaborationPreferences && userProfile.collaborationPreferences.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Collaboration Style</label>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.collaborationPreferences.map((style: string) => (
                        <span
                          key={style}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Additional Information</h3>
              <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {userProfile.country && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <CountryDisplay country={userProfile.country} />
                    </div>
                  )}

                  {userProfile.weeklyAvailability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Availability</label>
                      <div className="text-sm sm:text-base text-gray-600">{userProfile.weeklyAvailability} hours/week</div>
                    </div>
                  )}

                  {userProfile.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                      <div className="text-sm sm:text-base text-gray-600">
                        {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </Card>

      {isEditingPicture && (
        <ProfilePictureModal onClose={handlePictureModalClose} />
      )}
    </div>
  );
}