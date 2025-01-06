import { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { uploadProfileImage, deleteProfileImage } from '../../../../services/storageService';

export function useProfilePicture(onClose: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateProfile, userProfile, refreshUserProfile } = useAuth();

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Upload gambar baru terlebih dahulu
      const imageUrl = await uploadProfileImage(file);
      
      // Update profil dengan gambar baru
      await updateProfile({ 
        profileImage: imageUrl,
        profileEmoji: undefined,
        profileColor: undefined
      });

      // Refresh profil pengguna untuk memperbarui UI
      await refreshUserProfile();

      // Jika berhasil dan ada gambar lama, coba hapus gambar lama
      if (userProfile?.profileImage && userProfile.profileImage !== imageUrl) {
        try {
          await deleteProfileImage(userProfile.profileImage);
        } catch (error) {
          // Jika gagal menghapus gambar lama, kita biarkan saja
          console.warn('Failed to delete old profile image:', error);
        }
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal mengupload gambar');
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    handleUpload
  };
}