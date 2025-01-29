import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { CountryDisplay } from '../auth/registration/inputs/CountryDisplay';
import { ProjectPortfolio } from './ProjectPortfolio';
import { motion } from 'framer-motion';

export function ProfilePreview() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden bg-white border border-gray-200">
        {/* Header with gradient overlay */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-30"></div>
          <div className="relative px-8 py-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Profile Picture */}
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.fullName}
                    className="w-full h-full rounded-full object-cover ring-4 ring-white border border-gray-200"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-2xl sm:text-3xl ring-4 ring-white border border-gray-200"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  {userProfile.fullName}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-5">{userProfile.professionalTitle}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4">
                  {userProfile.experienceLevel && (
                    <span className="text-sm text-gray-500">
                      {userProfile.experienceLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-6">Basic information</h3>
            <Card className="p-8 space-y-8 border border-gray-200">
              {userProfile.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Bio</label>
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed">{userProfile.bio}</div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {userProfile.yearsOfExperience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <div className="text-sm sm:text-base text-gray-600">{userProfile.yearsOfExperience} years</div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Skills & Preferences */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-6">Skills & preferences</h3>
            <Card className="p-8 space-y-8 border border-gray-200">
              {userProfile.skills && userProfile.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.skills.map((skill: string) => (
                      <motion.span
                        key={skill}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {userProfile.languages && userProfile.languages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.languages.map((lang: string) => (
                      <motion.span
                        key={lang}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-6">Additional information</h3>
            <Card className="p-8 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {userProfile.weeklyAvailability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly availability</label>
                    <div className="text-sm sm:text-base text-gray-600">{userProfile.weeklyAvailability} hours/week</div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Portfolio Projects */}
      <ProjectPortfolio />
    </div>
  );
}