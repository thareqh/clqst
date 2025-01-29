import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MagnifyingGlassIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface ProjectImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
}

export function ProjectImageUpload({ onImageSelect, currentImage }: ProjectImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center p-6">
          {currentImage ? (
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img
                src={currentImage}
                alt="Project icon"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('project-image')?.click()}
              className="relative"
            >
              <PaperClipIcon className="w-4 h-4 mr-2" />
              Choose Icon
            </Button>
            <input
              id="project-image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG up to 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}