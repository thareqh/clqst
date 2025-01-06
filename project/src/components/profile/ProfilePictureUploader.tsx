import { useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { uploadProfileImage } from '../../services/storageService';

interface ProfilePictureUploaderProps {
  onClose?: () => void;
}

export function ProfilePictureUploader({ onClose }: ProfilePictureUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProfile } = useAuth();

  const handleUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    try {
      setIsUploading(true);
      
      // Upload gambar baru
      const imageUrl = await uploadProfileImage(file);
      
      // Update profil
      await updateProfile({ 
        profileImage: imageUrl,
        profileEmoji: undefined,
        profileColor: undefined 
      });

      onClose?.();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center ${
        isDragging ? 'border-black bg-gray-50' : 'border-gray-200'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
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
      <Button
        onClick={() => fileInputRef.current?.click()}
        loading={isUploading}
      >
        Choose File
      </Button>
    </div>
  );
}