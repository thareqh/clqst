import { useRef } from 'react';
import { Button } from '../../../ui/Button';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  isDragging: boolean;
  onDragStateChange: (isDragging: boolean) => void;
}

export function FileUploader({ 
  onFileSelect, 
  isUploading, 
  isDragging,
  onDragStateChange 
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragStateChange(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center ${
        isDragging ? 'border-black bg-gray-50' : 'border-gray-200'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragStateChange(true);
      }}
      onDragLeave={() => onDragStateChange(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
        className="hidden"
      />
      
      <div className="text-4xl mb-4">📷</div>
      <p className="text-gray-600 mb-4">
        Drag and drop your photo here, or
      </p>
      <Button
        onClick={() => fileInputRef.current?.click()}
        loading={isUploading}
      >
        Choose File
      </Button>
    </div>
  );
}