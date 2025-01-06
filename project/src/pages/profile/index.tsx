import { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Container } from '../../components/layout/Container';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProfilePicture } from '../../components/profile/ProfilePicture';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { ProfilePreview } from '../../components/profile/ProfilePreview';
import { ProfilePictureModal } from '../../components/profile/picture/ProfilePictureModal';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const { userProfile } = useAuth();

  const handlePictureModalClose = () => {
    setIsEditingPicture(false);
  };

  const handleEditSuccess = () => {
    // Tidak perlu melakukan apa-apa karena state akan diupdate oleh context
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">😢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600">
            Your profile is not available or has been removed
          </p>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <Container>
        <div className="max-w-3xl mx-auto pt-12">
          <Card className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => setIsEditingPicture(true)}
              >
                <ProfilePicture size="lg" />
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">Change</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-medium mb-2">Profile Settings</h1>
                    <p className="text-gray-600">
                      Manage your account settings and preferences
                    </p>
                  </div>
                  <Button
                    variant={isEditing ? 'outline' : 'primary'}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
            </div>

            {isEditing ? (
              <ProfileForm 
                onCancel={() => setIsEditing(false)}
                onSuccess={handleEditSuccess}
              />
            ) : (
              <ProfilePreview />
            )}
          </Card>
        </div>

        {isEditingPicture && (
          <ProfilePictureModal onClose={handlePictureModalClose} />
        )}
      </Container>
    </PageLayout>
  );
}