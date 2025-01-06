import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '../../../../../../components/ui/Button';
import { FiFolder } from 'react-icons/fi';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CreateFolderModal({ isOpen, onClose, onSubmit }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    if (folderName.includes('/') || folderName.includes('\\')) {
      setError('Folder name cannot contain slashes');
      return;
    }

    onSubmit(folderName);
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <Dialog.Title className="text-xl font-medium mb-6">
            Create New Folder
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiFolder className="w-5 h-5 text-primary-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div>
                  <label 
                    htmlFor="folderName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Folder Name
                  </label>
                  <input
                    id="folderName"
                    type="text"
                    value={folderName}
                    onChange={(e) => {
                      setFolderName(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter folder name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm transition-shadow"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!folderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
} 