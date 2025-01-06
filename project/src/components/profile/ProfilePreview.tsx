import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { CountryDisplay } from '../auth/registration/inputs/CountryDisplay';
import { ProjectPortfolio } from './ProjectPortfolio';

export function ProfilePreview() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-4">Basic Information</h3>
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <div className="text-lg font-medium">{userProfile.fullName}</div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="text-lg">{userProfile.email}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Professional Title</label>
            <div className="text-lg">{userProfile.professionalTitle}</div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Bio</label>
            <div className="text-gray-600">{userProfile.bio}</div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-4">Skills & Preferences</h3>
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Project Preferences</label>
            <div className="flex flex-wrap gap-2">
              {userProfile.projectPreferences?.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Collaboration Preferences</label>
            <div className="flex flex-wrap gap-2">
              {userProfile.collaborationPreferences?.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
              {userProfile.languages?.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-4">Additional Information</h3>
        <Card className="p-6 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <CountryDisplay country={userProfile.country} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Weekly Availability</label>
            <div className="text-lg">{userProfile.weeklyAvailability} hours/week</div>
          </div>
        </Card>
      </div>

      <ProjectPortfolio />
    </div>
  );
}