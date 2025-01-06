import { Button } from '../ui/Button';
import { ProfileFormFields } from './form/ProfileFormFields';
import { useProfileForm } from './form/useProfileForm';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ProfileForm({ onCancel, onSuccess }: ProfileFormProps) {
  const { refreshUserProfile } = useAuth();
  const { formData, setFormData, isLoading, handleSubmit: submitForm } = useProfileForm(async () => {
    console.log('Form submission complete, refreshing profile data');
    await refreshUserProfile();
    console.log('Profile data refreshed');
    onSuccess?.();
    onCancel();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered');
    await submitForm(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileFormFields 
        formData={formData}
        onChange={setFormData}
      />

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}