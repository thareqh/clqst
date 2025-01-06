import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { CountryFlag } from '../ui/CountryFlag';
import { COUNTRIES } from '../auth/registration/data/countries';
import type { User } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const { userProfile } = useAuth();
  const isOwnProfile = userProfile?.id === user.id;
  const profilePath = isOwnProfile ? '/app/profile' : `/app/users/${user.id}`;

  // Convert country name to country code
  const countryData = COUNTRIES.find(c => c.name === user.location);
  const countryCode = countryData?.code || '';

  return (
    <Link to={profilePath}>
      <Card className="group hover:shadow-lg transition-all h-full">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading avatar:', e);
                      const target = e.currentTarget;
                      const parent = target.parentElement;
                      
                      // Log untuk debugging
                      console.log('Avatar load error for:', user.fullName);
                      console.log('Avatar URL:', user.avatar);
                      
                      // Hapus gambar yang error
                      target.remove();
                      
                      // Tambahkan fallback dengan inisial
                      if (parent) {
                        parent.classList.add('bg-gradient-to-br', 'from-primary-100', 'to-primary-200', 'flex', 'items-center', 'justify-center');
                        const span = document.createElement('span');
                        span.className = 'text-2xl text-primary-700';
                        span.textContent = user.fullName.charAt(0).toUpperCase();
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-2xl text-primary-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h4 className="text-xl font-medium mb-1 group-hover:text-primary-600 transition-colors">
                {user.fullName}
              </h4>
              <p className="text-gray-600 mb-2">{user.professionalTitle}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {countryCode && <CountryFlag countryCode={countryCode} />}
                <span>{user.location}</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {user.skills.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
} 