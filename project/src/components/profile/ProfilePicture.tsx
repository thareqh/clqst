import { useAuth } from '../../contexts/AuthContext';

interface ProfilePictureProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
}

export function ProfilePicture({ 
  size = 'md', 
  className = '', 
  onClick,
  asButton = false 
}: ProfilePictureProps) {
  const { userProfile } = useAuth();
  const name = userProfile?.fullName || 'User';

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-24 h-24 text-2xl'
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const Component = asButton ? 'button' : 'div';

  return (
    <Component 
      onClick={onClick}
      className={`${sizes[size]} rounded-full flex items-center justify-center font-medium text-gray-600 overflow-hidden ${className}`}
      style={{ backgroundColor: userProfile?.profileColor || '#f3f4f6' }}
    >
      {userProfile?.profileImage ? (
        <img 
          src={userProfile.profileImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : userProfile?.profileEmoji ? (
        <span className="text-2xl">{userProfile.profileEmoji}</span>
      ) : (
        initials
      )}
    </Component>
  );
}