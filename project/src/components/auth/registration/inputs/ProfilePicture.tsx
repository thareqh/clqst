import { motion } from 'framer-motion';

interface ProfilePictureProps {
  name: string;
  image?: string;
  emoji?: string;
  backgroundColor?: string;
}

export function ProfilePicture({ name, image, emoji, backgroundColor = '#f3f4f6' }: ProfilePictureProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      className="relative w-24 h-24 rounded-full overflow-hidden"
      whileHover={{ scale: 1.05 }}
      style={{ backgroundColor }}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : emoji ? (
        <div className="w-full h-full flex items-center justify-center text-4xl">
          {emoji}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-gray-600">
          {initials}
        </div>
      )}
    </motion.div>
  );
}