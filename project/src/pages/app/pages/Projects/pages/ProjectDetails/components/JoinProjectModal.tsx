import { useState, useRef, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../../../../../../components/ui/Button';
import { Card } from '../../../../../../../components/ui/Card';
import type { Project, ProjectRole } from '../../../../../../../types/project';

interface JoinProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (roleId: string | null, message: string, attachments: File[]) => Promise<void>;
}

export function JoinProjectModal({ project, isOpen, onClose, onSubmitRequest }: JoinProjectModalProps) {
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmitRequest(selectedRole?.title || null, message, attachments);
      onClose();
    } catch (error) {
      console.error('Error submitting join request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <Card className="relative w-full max-w-2xl p-6 space-y-6 bg-white">
          <Dialog.Title className="text-2xl font-medium">
            Request to Join {project.title}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Project Description</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>

              {project.requiredRoles && project.requiredRoles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Available Roles</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {project.requiredRoles.map((role) => (
                      <button
                        key={role.title}
                        type="button"
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
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Message to Project Owner</h3>
                  <span className="text-sm text-gray-500">* Required</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                  placeholder="Introduce yourself and explain why you would be a great fit for this project..."
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Your request will be reviewed by the project owner. You'll be notified once they make a decision.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Attachments (Optional)</h3>
                <div className="space-y-4">
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 hover:text-red-500"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Add Attachment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!message.trim()}
              >
                {project.requiredRoles && project.requiredRoles.length > 0 
                  ? (selectedRole 
                    ? `Submit Request as ${selectedRole.title}`
                    : 'Select a Role to Request'
                  )
                  : 'Submit Request'
                }
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Dialog>
  );
}