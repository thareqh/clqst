import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/Button';

interface NewThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { content: string }) => void;
}

export function NewThreadModal({ isOpen, onClose, onSubmit }: NewThreadModalProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content });
    setContent('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl w-full rounded-lg bg-white">
          <div className="p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Start New Discussion
            </Dialog.Title>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="What's on your mind?"
                required
              />
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Post
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 