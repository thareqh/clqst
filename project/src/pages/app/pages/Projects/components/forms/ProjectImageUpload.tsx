import { useRef, useState } from 'react';
import { Card } from '../../../../../../components/ui/Card';
import { Button } from '../../../../../../components/ui/Button';

interface ProjectImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
}

export function ProjectImageUpload({ onImageSelect, currentImage }: ProjectImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">
        Project Cover Image
      </label>
      <Card
        className={`p-6 border-2 border-dashed ${
          isDragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageSelect(file);
          }}
          className="hidden"
        />

        <div className="text-center">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Project cover"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="text-4xl mb-4">🖼️</div>
          )}
          <p className="text-gray-600 mb-4">
            Drag and drop your image here, or
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>
      </Card>
    </div>
  );
}