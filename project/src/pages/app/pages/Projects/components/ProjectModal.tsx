import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../../components/ui/Button';
import { SearchableMultiSelect } from '../../../../../components/auth/registration/inputs/SearchableMultiSelect';
import { SKILLS } from '../../../../../components/auth/registration/data/skills';
import { createProject } from '../../../../../services/projectService';
import { useAuth } from '../../../../../contexts/AuthContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProjectModal({ isOpen, onClose, onSuccess }: ProjectModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    setIsLoading(true);
    try {
      await createProject({
        ...formData,
        status: 'open',
        owner: {
          id: currentUser.uid,
          name: userProfile.fullName,
          avatar: userProfile.profileImage
        },
        members: [{
          id: currentUser.uid,
          name: userProfile.fullName,
          avatar: userProfile.profileImage,
          role: 'owner'
        }]
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-medium mb-6">Create New Project</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border"
                  rows={4}
                  required
                />
              </div>

              <SearchableMultiSelect
                label="Required Skills"
                options={SKILLS}
                value={formData.skills}
                onChange={(skills) => setFormData({ ...formData, skills })}
                placeholder="Select skills"
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                >
                  Create Project
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}