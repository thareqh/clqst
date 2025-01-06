import { useState } from 'react';
import { ProfilePictureTabs } from './picture/ProfilePictureTabs';
import { ProfilePictureUploader } from './picture/ProfilePictureUploader';
import { ProfilePictureEmoji } from './picture/ProfilePictureEmoji';
import { ProfilePictureDelete } from './picture/ProfilePictureDelete';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePictureEditorProps {
  onClose: () => void;
}

export function ProfilePictureEditor({ onClose }: ProfilePictureEditorProps) {
  const [selectedTab, setSelectedTab] = useState<'upload' | 'emoji'>('upload');
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <ProfilePictureTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {selectedTab === 'upload' ? (
        <ProfilePictureUploader onClose={onClose} />
      ) : (
        <ProfilePictureEmoji onClose={onClose} />
      )}

      {(userProfile?.profileImage || userProfile?.profileEmoji) && (
        <ProfilePictureDelete onClose={onClose} />
      )}
    </div>
  );
}