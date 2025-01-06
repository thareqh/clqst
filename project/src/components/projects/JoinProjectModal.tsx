import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Project, ProjectRole } from '../../types/project';

interface JoinProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roleId: string) => Promise<void>;
}

export function JoinProjectModal({ project, isOpen, onClose, onJoin }: JoinProjectModalProps) {
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    try {
      await onJoin(selectedRole.title);
      onClose();
    } catch (error) {
      console.error('Error joining project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <Card className="relative w-full max-w-2xl p-6 space-y-6">
          <Dialog.Title className="text-2xl font-medium">
            Bergabung dengan {project.title}
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Deskripsi Proyek</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Role yang Tersedia</h3>
              <div className="grid grid-cols-1 gap-4">
                {project.requiredRoles.map((role) => (
                  <button
                    key={role.title}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full p-4 border rounded-lg text-left transition-all hover:border-primary-500 ${
                      selectedRole?.title === role.title ? 'border-primary-500 ring-2 ring-primary-500/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${role.color}15`,
                            color: role.color
                          }}
                        >
                          {role.title}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2">{role.description}</p>
                    {role.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {role.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleJoin}
              loading={isLoading}
              disabled={!selectedRole}
            >
              {selectedRole 
                ? `Bergabung sebagai ${selectedRole.title}`
                : 'Pilih Role untuk Bergabung'
              }
            </Button>
          </div>
        </Card>
      </div>
    </Dialog>
  );
} 