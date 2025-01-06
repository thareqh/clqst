import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { uploadProfileImage } from '../../services/storageService';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileImageUploadProps {
  onUploadComplete?: () => void;
}

export function ProfileImageUpload({ onUploadComplete }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile, userProfile } = useAuth();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadProfileImage(file);
      await updateProfile({ profileImage: imageUrl });
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100"
        whileHover={{ scale: 1.05 }}
      >
        {userProfile?.profileImage ? (
          <img 
            src={userProfile.profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        loading={isUploading}
      >
        {userProfile?.profileImage ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
}