import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePictureEmojiProps {
  onClose?: () => void;
}

const EMOJIS = [
  '👩‍💻', '👨‍💻', '🎨', '📊', '🚀', '💡', '🎯', '📱',
  '💻', '⚡️', '🔥', '✨', '🌟', '🎮', '🎸', '📷'
];

const COLORS = [
  '#f3f4f6', '#fee2e2', '#fef3c7', '#ecfccb', 
  '#d1fae5', '#dbeafe', '#ede9fe', '#fae8ff'
];

export function ProfilePictureEmoji({ onClose }: ProfilePictureEmojiProps) {
  const { updateProfile } = useAuth();

  const handleSelect = async (emoji: string, color: string) => {
    try {
      await updateProfile({
        profileEmoji: emoji,
        profileColor: color,
        profileImage: undefined
      });
      onClose?.();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            onClick={() => handleSelect(emoji, COLORS[0])}
            className="text-3xl p-4 rounded-xl hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-medium mb-3">Background Color</h4>
        <div className="grid grid-cols-4 gap-4">
          {COLORS.map((color) => (
            <motion.button
              key={color}
              onClick={() => handleSelect(EMOJIS[0], color)}
              className="w-12 h-12 rounded-xl"
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}