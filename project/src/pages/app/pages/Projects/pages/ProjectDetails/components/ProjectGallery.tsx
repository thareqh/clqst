import { useState } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../../../../../../../types/project';
import { Card } from '../../../../../../../components/ui/Card';
import { Button } from '../../../../../../../components/ui/Button';
import { storage } from '../../../../../../../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { removeProjectImage } from '../../../../../../../services/projectService';

interface ProjectGalleryProps {
  project: Project;
  isProjectOwner: boolean;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: (imageUrl: string) => void;
}

export function ProjectGallery({ project, isProjectOwner, onImageUpload, onImageRemove }: ProjectGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageRef = ref(storage, `projects/${project.id}/images/${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      onImageUpload(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      // TODO: Show error notification
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = async (imageUrl: string) => {
    try {
      setIsRemoving(imageUrl);
      // Delete from storage
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      // Remove from project
      await onImageRemove(imageUrl);
    } catch (error) {
      console.error('Error removing image:', error);
      // TODO: Show error notification
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-gray-700">Project Gallery</h3>
        {isProjectOwner && (
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>{isUploading ? 'Uploading...' : 'Add Images'}</span>
              </Button>
            </label>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.images?.map((image, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group"
          >
            <img
              src={image.url}
              alt={image.caption || `Project image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {isProjectOwner && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white/20"
                  onClick={() => handleImageRemove(image.url)}
                  disabled={isRemoving === image.url}
                >
                  {isRemoving === image.url ? 'Removing...' : 'Remove'}
                </Button>
              </div>
            )}
          </motion.div>
        ))}
        {(!project.images || project.images.length === 0) && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">📷</div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">No images yet</h4>
            <p className="text-sm text-gray-500">
              {isProjectOwner 
                ? "Add some images to showcase your project"
                : "The project owner hasn't added any images yet"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 