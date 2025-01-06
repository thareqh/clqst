import { RegistrationData } from '../../../../types/auth';
import { motion } from 'framer-motion';
import { Card } from '../../../ui/Card';
import { ProfilePicture } from '../inputs/ProfilePicture';
import { CountryDisplay } from '../inputs/CountryDisplay';

interface ReviewStepProps {
  data: RegistrationData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">Review Your Profile</h3>
        <p className="text-sm text-gray-600">Here's how your profile will appear to other users</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-6">
            <ProfilePicture
              name={data.fullName}
              image={data.profileImage}
              emoji={data.profileEmoji}
              backgroundColor={data.profileColor}
            />
            <div className="flex-1">
              <h4 className="text-xl font-medium mb-1">{data.fullName}</h4>
              <p className="text-gray-600 mb-2">{data.professionalTitle}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{data.experienceLevel}</span>
                <span>•</span>
                <CountryDisplay country={data.country} />
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <h5 className="text-sm font-medium mb-3">Skills</h5>
            <div className="flex flex-wrap gap-2">
              {data.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-6">
            <h5 className="text-sm font-medium mb-3">Project Preferences</h5>
            <div className="flex flex-wrap gap-2">
              {data.projectPreferences?.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Languages</h5>
              <p className="text-gray-600">{data.languages?.join(', ')}</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Collaboration</h5>
              <p className="text-gray-600">{data.collaborationStyles?.join(', ')}</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Weekly Availability</h5>
              <p className="text-gray-600">{data.weeklyAvailability} hours/week</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Experience</h5>
              <p className="text-gray-600">{data.yearsOfExperience} years</p>
            </div>
          </div>
        </Card>

        {/* Contact Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-gray-50 rounded-xl p-4"
        >
          <h5 className="text-sm font-medium mb-2">Contact Information</h5>
          <p className="text-sm text-gray-600">{data.email}</p>
        </motion.div>
      </motion.div>

      <div className="text-center text-sm text-gray-500">
        Click "Complete" to finish your registration and create your profile
      </div>
    </div>
  );
}