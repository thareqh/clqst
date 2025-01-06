import { useState } from 'react';
import { ProfilePictureUploader } from './ProfilePictureUploader';
import { ProfilePictureDelete } from './ProfilePictureDelete';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfilePictureEditorProps {
  onClose: () => void;
}

export function ProfilePictureEditor({ onClose }: ProfilePictureEditorProps) {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <ProfilePictureUploader onClose={onClose} />

      {userProfile?.profileImage && (
        <ProfilePictureDelete onClose={onClose} />
      )}
    </div>
  );
}