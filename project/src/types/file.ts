export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  source: 'discussion' | 'chat' | 'manual';
  projectId: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  projectId: string;
  isSystemFolder?: boolean;
}

export interface FileSystemState {
  files: FileItem[];
  folders: Folder[];
  currentPath: string;
  selectedItems: string[];
  isLoading: boolean;
  error?: string;
}

export const FILE_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB per file untuk free tier
  totalStorage: 512 * 1024 * 1024, // 512MB total storage
  allowedTypes: '*/*', // Semua tipe file
  maxFileCount: 10, // Maksimum 10 file sekaligus
};

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (file.size > FILE_LIMITS.maxFileSize) {
    return {
      valid: false,
      error: `File terlalu besar. Maksimum ukuran file adalah ${formatFileSize(FILE_LIMITS.maxFileSize)}`
    };
  }

  return { valid: true };
} 