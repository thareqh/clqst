import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ProfilePicture } from './ProfilePicture';

interface ProfilePictureEditorProps {
  name: string;
  image?: string;
  emoji?: string;
  backgroundColor?: string;
  onUpdate: (fields: { profileImage?: string; profileEmoji?: string; profileColor?: string }) => void;
}

export function ProfilePictureEditor({
  name,
  image,
  emoji,
  backgroundColor = '#f3f4f6',
  onUpdate
}: ProfilePictureEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ profileImage: e.target?.result as string });
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate({ profileImage: e.target?.result as string });
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }}
      >
        <ProfilePicture
          name={name}
          image={image}
          emoji={emoji}
          backgroundColor={backgroundColor}
        />
        <motion.button
          onClick={() => setIsEditing(true)}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✏️
        </motion.button>
      </motion.div>

      {isEditing && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium">Edit Profile Picture</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                isDragging ? 'border-black bg-gray-50' : 'border-gray-200'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-4xl mb-4">📷</div>
              <p className="text-gray-600 mb-4">
                Drag and drop your photo here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Choose File
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}