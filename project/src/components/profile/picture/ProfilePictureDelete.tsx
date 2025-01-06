import { useState } from 'react';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteProfileImage } from '../../../services/storageService';

interface ProfilePictureDeleteProps {
  onClose: () => void;
}

export function ProfilePictureDelete({ onClose }: ProfilePictureDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { updateProfile, userProfile } = useAuth();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Hapus gambar dari storage jika ada
      if (userProfile?.profileImage) {
        try {
          await deleteProfileImage(userProfile.profileImage);
        } catch (error) {
          console.warn('Failed to delete profile image from storage:', error);
        }
      }

      // Update profil
      await updateProfile({
        profileImage: undefined,
        profileEmoji: undefined,
        profileColor: undefined
      });

      onClose();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-100">
      <Button
        variant="outline"
        onClick={handleDelete}
        loading={isDeleting}
        className="w-full text-red-500 hover:text-red-600 hover:border-red-200"
      >
        Remove Profile Picture
      </Button>
    </div>
  );
}