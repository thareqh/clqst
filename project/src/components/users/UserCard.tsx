import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { CountryFlag } from '../ui/CountryFlag';
import { COUNTRIES } from '../auth/registration/data/countries';
import type { User } from '../../types/user';
import { useAuth } from '../../hooks/useAuth';
import { FiClock } from 'react-icons/fi';

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
      <Card className="group border border-gray-200 hover:border-gray-300 transition-all h-full">
        <div className="p-5">
          {/* Header Section */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {user.avatar ? (
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-100">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const parent = target.parentElement;
                      target.remove();
                      if (parent) {
                        parent.classList.add('bg-gradient-to-br', 'from-primary-100', 'to-primary-200', 'flex', 'items-center', 'justify-center');
                        const span = document.createElement('span');
                        span.className = 'text-xl text-primary-700 font-medium';
                        span.textContent = user.fullName.charAt(0).toUpperCase();
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-xl text-primary-700 font-medium">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 mb-0.5 truncate group-hover:text-primary-600 transition-colors">
                {user.fullName}
              </h4>
              <p className="text-sm text-gray-600 mb-1.5 truncate">{user.professionalTitle}</p>
              <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                {countryCode && (
                  <div className="flex items-center gap-1">
                    <CountryFlag countryCode={countryCode} />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.experienceLevel && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                    <span>{user.experienceLevel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {user.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {user.skills.length > 5 && (
                  <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded-full text-xs">
                    +{user.skills.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
} 