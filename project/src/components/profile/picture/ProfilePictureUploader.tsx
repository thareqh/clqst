import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { useProfilePicture } from './hooks/useProfilePicture';

interface ProfilePictureUploaderProps {
  onClose: () => void;
}

export function ProfilePictureUploader({ onClose }: ProfilePictureUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { isUploading, handleUpload } = useProfilePicture(onClose);

  return (
    <FileUploader
      onFileSelect={handleUpload}
      isUploading={isUploading}
      isDragging={isDragging}
      onDragStateChange={setIsDragging}
    />
  );
}