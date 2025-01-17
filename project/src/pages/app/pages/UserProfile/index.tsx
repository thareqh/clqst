import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { CountryDisplay } from '../../../../components/auth/registration/inputs/CountryDisplay';
import type { User } from '../../../../types/user';
import type { Project } from '../../../../types/project';
import { useAuth } from '../../../../hooks/useAuth';
import { createChat } from '../../../../services/chatService';

export function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userProfile: currentUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);

          // Fetch all projects (owned and joined)
          const [ownedSnapshot, joinedSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'projects'), where('owner.id', '==', userId))),
            getDocs(query(collection(db, 'projects'), where('members', 'array-contains', { id: userId })))
          ]);

          const ownedProjects = ownedSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          const joinedProjects = joinedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() })) as Project[];

          // Combine and remove duplicates
          const allProjects = [...ownedProjects, ...joinedProjects.filter(project => project.owner.id !== userId)];
          const uniqueProjects = Array.from(new Map(allProjects.map(project => [project.id, project])).values());
          
          setOwnedProjects(uniqueProjects);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleMessage = async () => {
    if (!currentUser || !user) return;

    try {
      // Create or get existing chat
      const chat = await createChat([
        {
          id: currentUser.id,
          name: currentUser.fullName,
          avatar: currentUser.avatar || currentUser.profileImage
        },
        {
          id: user.id,
          name: user.fullName,
          avatar: user.avatar || user.profileImage
        }
      ]);

      // Navigate to chat page with chat ID
      navigate(`/app/chat/${chat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      // TODO: Show error notification
    }
  };

  const ProjectList = ({ projects }: { projects: Project[] }) => (
    <div className="grid grid-cols-2 gap-6">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="cursor-pointer group"
          onClick={() => navigate(`/app/projects/${project.id}`)}
        >
          <div className="relative w-full pt-[56.25%] bg-gray-100 rounded-lg overflow-hidden mb-3">
            {project.coverImage ? (
              <img
                src={project.coverImage}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-medium mb-2 group-hover:text-primary-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {project.shortDescription}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.skills?.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-gray-100 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
            {project.skills && project.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                +{project.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <div className="animate-pulse">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600">
            The user you're looking for doesn't exist or has been removed
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
            <div className="w-24 h-24 sm:w-32 sm:h-32">
              {user?.avatar || user?.profileImage ? (
                <img
                  src={user.avatar || user.profileImage}
                  alt={user.fullName}
                  className="w-full h-full rounded-full object-cover ring-4 ring-gray-50"
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl ring-4 ring-gray-50"
                  style={{ backgroundColor: user?.profileColor || '#f3f4f6' }}
                >
                  {user?.profileEmoji || user?.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold mb-2">{user?.fullName}</h1>
                  <p className="text-base sm:text-lg text-gray-600 mb-4">{user?.professionalTitle}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-6">
                    {user?.country && (
                      <div className="flex items-center gap-2">
                        <CountryDisplay country={user.country} />
                      </div>
                    )}
                    {user?.experienceLevel && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        <span className="text-sm">
                          {user.experienceLevel} experience
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleMessage}
                  className="flex items-center gap-2 hover:bg-gray-50 w-full sm:w-auto"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Send Message</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Basic Information</h3>
            <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
              {user.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed">{user.bio}</div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {user.yearsOfExperience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <div className="text-sm sm:text-base text-gray-600">{user.yearsOfExperience} years</div>
                  </div>
                )}
                {user.timezone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <div className="text-sm sm:text-base text-gray-600">{user.timezone}</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Skills & Preferences */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Skills & Preferences</h3>
            <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
              {user.skills && user.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string) => (
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

              {user.projectPreferences && user.projectPreferences.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Project Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {user.projectPreferences.map((pref: string) => (
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

              {user.languages && user.languages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang: string) => (
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

              {user.collaborationPreferences && user.collaborationPreferences.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">Collaboration Style</label>
                  <div className="flex flex-wrap gap-2">
                    {user.collaborationPreferences.map((style: string) => (
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
                {user.country && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <CountryDisplay country={user.country} />
                  </div>
                )}

                {user.weeklyAvailability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Availability</label>
                    <div className="text-sm sm:text-base text-gray-600">{user.weeklyAvailability} hours/week</div>
                  </div>
                )}

                {user.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <div className="text-sm sm:text-base text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
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
      </Card>
    </div>
  );
} 