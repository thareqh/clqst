import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiFolder, FiFile, FiUpload, FiFolderPlus, FiTrash2, FiArrowLeft, FiHardDrive, FiMessageCircle, FiMessageSquare, FiMove, FiCopy, FiMoreVertical, FiGrid, FiList, FiChevronRight, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import type { FileItem, Folder, FileSystemState } from '@/types/file';
import { FILE_LIMITS, formatFileSize, validateFileUpload } from '@/types/file';
import { uploadFile, getFiles, getFolders, createFolder, deleteFile, deleteFolder, getParentPath, joinPaths, moveFile, moveFolder, calculateTotalStorage } from '@/services/fileService';
import { CreateFolderModal } from './CreateFolderModal';
import { Menu, Dialog } from '@headlessui/react';

interface ResourcesTabProps {
  projectId: string;
}

const SYSTEM_FOLDERS = [
  {
    name: 'discussions',
    icon: FiMessageCircle,
    label: 'Discussion Files',
    color: 'text-blue-500'
  },
  {
    name: 'chats',
    icon: FiMessageSquare,
    label: 'Chat Files',
    color: 'text-green-500'
  }
];

export function ResourcesTab({ projectId }: ResourcesTabProps) {
  const { user } = useAuth();
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: FILE_LIMITS.totalStorage,
  });
  const [state, setState] = useState<FileSystemState>({
    files: [],
    folders: [],
    currentPath: '/',
    selectedItems: [],
    isLoading: false
  });
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItemForMove, setSelectedItemForMove] = useState<{id: string, type: 'file' | 'folder'} | null>(null);
  const [moveTargetPath, setMoveTargetPath] = useState('/');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuTarget, setContextMenuTarget] = useState<{id: string, type: 'file' | 'folder'} | null>(null);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);

  // Inisialisasi folder sistem saat komponen dimuat
  useEffect(() => {
    const initializeSystemFolders = async () => {
      if (!projectId) return;

      try {
        const folders = await getFolders(projectId, '/');
        const systemFolderPromises = SYSTEM_FOLDERS
          .filter(sysFolder => !folders.some(f => f.name === sysFolder.name))
          .map(sysFolder => 
            createFolder({
              name: sysFolder.name,
              path: '/',
              createdAt: new Date().toISOString(),
              createdBy: {
                id: user?.uid || '',
                name: user?.displayName || 'System',
                avatar: user?.photoURL || undefined
              },
              projectId,
              isSystemFolder: true
            })
          );

        if (systemFolderPromises.length > 0) {
          await Promise.all(systemFolderPromises);
          loadContent();
        }
      } catch (error) {
        console.error('Error initializing system folders:', error);
      }
    };

    initializeSystemFolders();
  }, [projectId]);

  const loadContent = async () => {
    if (!projectId) return;

    try {
      console.log('Loading content for path:', state.currentPath);
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Calculate total storage used
      const totalUsed = await calculateTotalStorage(projectId);
      setStorageInfo(prev => ({ ...prev, used: totalUsed }));

      // Get current path content
      const [files, folders] = await Promise.all([
        getFiles(projectId, state.currentPath),
        getFolders(projectId, state.currentPath)
      ]);
      
      console.log('Loaded content:', { files, folders });
      
      setState(prev => ({
        ...prev,
        files,
        folders,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load files and folders');
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to load content' }));
    }
  };

  useEffect(() => {
    loadContent();
  }, [projectId, state.currentPath]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('Selected files:', files);
    if (files.length === 0) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Check file count
    if (files.length > FILE_LIMITS.maxFileCount) {
      toast.error(`Maksimum ${FILE_LIMITS.maxFileCount} file dalam satu kali upload`);
      return;
    }

    // Validate each file
    const invalidFiles = files.map(file => ({
      file,
      validation: validateFileUpload(file)
    })).filter(item => !item.validation.valid);

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(item => {
        toast.error(`${item.file.name}: ${item.validation.error}`);
      });
      return;
    }

    // Check total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    console.log('Total size:', formatFileSize(totalSize), 'Current used:', formatFileSize(storageInfo.used), 'Total limit:', formatFileSize(storageInfo.total));
    
    if (totalSize + storageInfo.used > storageInfo.total) {
      toast.error(`Upload akan melebihi batas penyimpanan. Tersisa ${formatFileSize(storageInfo.total - storageInfo.used)}`);
      return;
    }

    // Initialize progress
    const initialProgress = files.reduce((acc, file) => ({
      ...acc,
      [file.name]: 0
    }), {});
    setUploadProgress(initialProgress);
    console.log('Starting upload for files:', files.map(f => f.name));

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await Promise.all(
        files.map(async (file) => {
          try {
            console.log('Uploading file:', file.name);
            // Update progress as file uploads
            const onProgress = (progress: number) => {
              console.log(`Upload progress for ${file.name}:`, progress);
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }));
            };

            const uploadedFile = await uploadFile(
              file, 
              projectId, 
              state.currentPath, 
              onProgress,
              user ? {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || undefined
              } : undefined
            );
            console.log('File uploaded successfully:', uploadedFile);
            
            // Clear progress when done
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            toast.error(`Failed to upload ${file.name}`);
          }
        })
      );

      toast.success('Files uploaded successfully');
      loadContent();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      setUploadProgress({});
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await createFolder(
        projectId,
        state.currentPath,
        folderName,
        {
          id: user.uid,
          name: user.displayName || 'Unknown User',
          avatar: user.photoURL
        }
      );

      toast.success('Folder created successfully');
      loadContent();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (itemToDelete.type === 'file') {
        const file = state.files.find(f => f.id === itemToDelete.id);
          if (file) {
            await deleteFile(projectId, file.id, file.url);
        }
      } else {
        await deleteFolder(projectId, itemToDelete.id);
          }

      toast.success(`${itemToDelete.type === 'file' ? 'File' : 'Folder'} deleted successfully`);
      loadContent();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleNavigate = (path: string) => {
    console.log('Navigating to path:', path);
    // Normalize path to remove multiple slashes
    const normalizedPath = '/' + path.split('/').filter(Boolean).join('/');
    console.log('Normalized path:', normalizedPath);
    setState(prev => ({ ...prev, currentPath: normalizedPath, selectedItems: [] }));
  };

  const handleSelect = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(item => item !== id)
        : [...prev.selectedItems, id]
    }));
  };

  const getStorageUsagePercentage = () => {
    return (storageInfo.used / storageInfo.total) * 100;
  };

  const handleMove = async (itemId: string, type: 'file' | 'folder', targetPath: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (type === 'file') {
        await moveFile(projectId, itemId, targetPath);
      } else {
        await moveFolder(projectId, itemId, targetPath);
      }

      toast.success(`${type === 'file' ? 'File' : 'Folder'} moved successfully`);
      loadContent();
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error(`Failed to move ${type}`);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
      setShowMoveModal(false);
      setSelectedItemForMove(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuTarget({ id, type });
    setShowContextMenu(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="space-y-8">
      {/* Storage Info */}
      <Card className="overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary-50 rounded-lg">
                <FiHardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Storage Usage</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {formatFileSize(storageInfo.used)} of {formatFileSize(storageInfo.total)} used
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              {Math.round(getStorageUsagePercentage())}% used
            </span>
          </div>
        </div>
        <div className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="w-full h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                getStorageUsagePercentage() > 90 
                  ? 'bg-red-500' 
                  : getStorageUsagePercentage() > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-primary-500'
              }`}
              style={{ width: `${getStorageUsagePercentage()}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Files List Card */}
      <Card className="overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Files & Folders</h2>
            <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewType('grid')}
              className={`p-1.5 sm:p-2 ${viewType === 'grid' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
              title="Grid view"
            >
              <FiGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-1.5 sm:p-2 ${viewType === 'list' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
              title="List view"
            >
              <FiList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200 bg-white px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                <FiFolder className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                {state.currentPath.split('/').map((segment, index, array) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <FiChevronRight className="w-3.5 h-3.5 text-gray-400 mx-1" />}
                    <span className={`${index === array.length - 1 ? 'text-gray-900 font-medium' : 'hover:text-gray-900 cursor-pointer'}`}
                          onClick={() => {
                            if (index < array.length - 1) {
                              handleNavigate('/' + array.slice(1, index + 1).join('/'));
                            }
                          }}>
                      {segment || 'Root'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {state.currentPath !== '/' && (
                <Button
                  variant="outline"
                  onClick={() => handleNavigate(getParentPath(state.currentPath))}
                  className="flex items-center gap-1.5 hover:bg-gray-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-sm"
                >
                  <FiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Back
                </Button>
              )}
          {state.currentPath !== '/discussions' && state.currentPath !== '/chats' && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-1.5 hover:bg-gray-50 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
              >
                <FiFolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Folder</span>
                <span className="sm:hidden">Folder</span>
              </Button>
              <Button 
                variant="primary" 
                className="flex items-center gap-1.5 shadow-sm hover:shadow-md transition-shadow group relative px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Upload Files</span>
                <span className="sm:hidden">Upload</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
            </>
          )}
          {state.selectedItems.length > 0 && (
            <Button
              variant="outline"
                  onClick={() => {
                    setItemToDelete({
                      id: state.selectedItems[0],
                      type: state.files.find(f => f.id === state.selectedItems[0]) ? 'file' : 'folder',
                      name: state.files.find(f => f.id === state.selectedItems[0])?.name || state.folders.find(f => f.id === state.selectedItems[0])?.name || ''
                    });
                    setShowDeleteModal(true);
                  }}
              className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-200 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
            >
              <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Delete Selected</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          )}
        </div>
      </div>
        </div>
        <div className="p-4 sm:p-8">
      {Object.keys(uploadProgress).length > 0 && (
            <Card className="p-6 shadow-sm mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-5 flex items-center gap-2">
            <FiUpload className="w-5 h-5 text-primary-500" />
            Uploading Files...
          </h3>
          <div className="space-y-4">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate max-w-[80%]">{fileName}</span>
                  <span className="text-primary-600 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
          {state.isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary-500"></div>
                <span className="text-xs sm:text-sm text-gray-500">Loading content...</span>
              </div>
            </div>
          ) : state.folders.length === 0 && state.files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <span className="text-4xl sm:text-5xl mb-4">📁</span>
              <span className="text-gray-500 text-base sm:text-lg">This folder is empty</span>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Upload files or create folders to get started</p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Folders */}
              {state.folders.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                    <FiFolder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Folders
                  </h3>
                  <div className={viewType === 'grid' ? 
                    "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" : 
                    "flex flex-col gap-2"
                  }>
                    {state.folders.map((folder) => {
                      const systemFolder = SYSTEM_FOLDERS.find(sf => sf.name === folder.name);
                      const Icon = systemFolder?.icon || FiFolder;
                      
                      return (
                        <div
                          key={folder.id}
                          className={`${
                            viewType === 'grid' ? 'p-3 sm:p-4' : 'p-2 sm:p-3'
                          } rounded-lg border transition-all duration-200 ${
                            state.selectedItems.includes(folder.id)
                              ? 'bg-primary-50 border-primary-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50/80 hover:border-primary-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div 
                              className="flex-1 flex items-center gap-2 sm:gap-3 cursor-pointer group"
                              onClick={() => handleNavigate(joinPaths(state.currentPath, folder.name))}
                            >
                              <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                                systemFolder?.color ? 'bg-blue-50' : 'bg-primary-50/60 group-hover:bg-primary-100'
                              }`}>
                                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${systemFolder?.color || 'text-primary-500'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm sm:text-base text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-200">
                                  {systemFolder?.label || folder.name}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                  {folder.isSystemFolder ? 'System Folder' : `Created by ${folder.createdBy.name}`}
                                </div>
                              </div>
                            </div>
                            {!folder.isSystemFolder && (
                              <Menu as="div" className="relative">
                                <Menu.Button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                  <FiMoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600" />
                                </Menu.Button>
                                <Menu.Items className="absolute right-0 mt-1 w-36 sm:w-48 bg-white rounded-lg border border-gray-200 py-1 z-10 focus:outline-none">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-gray-50' : ''
                                        } w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm flex items-center gap-2 text-gray-700 transition-colors duration-200`}
                                        onClick={() => {
                                          setSelectedItemForMove({ id: folder.id, type: 'folder' });
                                          setShowMoveModal(true);
                                        }}
                                      >
                                        <FiMove className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Move
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`${
                                          active ? 'bg-red-50' : ''
                                        } w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm flex items-center gap-2 text-red-600 transition-colors duration-200`}
                                        onClick={() => {
                                          setItemToDelete({
                                            id: folder.id,
                                            type: 'folder',
                                            name: folder.name
                                          });
                                          setShowDeleteModal(true);
                                        }}
                                      >
                                        <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Menu>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files */}
              {state.files.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                    <FiFile className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Files
                  </h3>
                  <div className={viewType === 'grid' ? 
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" : 
                    "flex flex-col gap-2"
                  }>
                    {state.files.map((file) => (
                      <div
                        key={file.id}
                        className={`${
                          viewType === 'grid' ? 'p-3 sm:p-4' : 'p-2 sm:p-3'
                        } rounded-lg border transition-colors duration-200 ${
                          state.selectedItems.includes(file.id)
                            ? 'bg-primary-50 border-primary-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50/80 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div 
                            className="flex-1 flex items-start gap-2 sm:gap-3 cursor-pointer group min-w-0"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200 shrink-0">
                              <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                              <div className="font-medium text-sm sm:text-base text-gray-900 break-all group-hover:text-primary-600 transition-colors duration-200">
                                {file.name}
                              </div>
                              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                                {formatFileSize(file.size || 0)} • {file.type}
                              </div>
                            </div>
                          </div>
                          <Menu as="div" className="relative shrink-0">
                            <Menu.Button className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                              <FiMoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-1 w-36 sm:w-48 bg-white rounded-lg border border-gray-200 py-1 z-10 focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-gray-50' : ''
                                    } w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm flex items-center gap-2 text-gray-700 transition-colors duration-200`}
                                    onClick={() => {
                                      setSelectedItemForMove({ id: file.id, type: 'file' });
                                      setShowMoveModal(true);
                                    }}
                                  >
                                    <FiMove className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Move
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active ? 'bg-red-50' : ''
                                    } w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm flex items-center gap-2 text-red-600 transition-colors duration-200`}
                                    onClick={() => {
                                      setItemToDelete({
                                        id: file.id,
                                        type: 'file',
                                        name: file.name
                                      });
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Menu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Move Modal */}
      {showMoveModal && selectedItemForMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FiMove className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium">Move {selectedItemForMove.type === 'file' ? 'File' : 'Folder'}</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select destination folder
                </label>
                <select
                  value={moveTargetPath}
                  onChange={(e) => setMoveTargetPath(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="/">Root</option>
                  {state.folders
                    .filter(f => !f.isSystemFolder)
                    .map(folder => (
                      <option key={folder.id} value={joinPaths(folder.path, folder.name)}>
                        {joinPaths(folder.path, folder.name)}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMoveModal(false);
                    setSelectedItemForMove(null);
                  }}
                  className="hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleMove(selectedItemForMove.id, selectedItemForMove.type, moveTargetPath)}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  Move
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onConfirm={async (name) => {
          if (!user) {
            toast.error('You must be logged in to create a folder');
            return;
          }

          try {
            setState(prev => ({ ...prev, isLoading: true }));
            const userPhotoURL = user.photoURL === null ? undefined : user.photoURL;
            
            await createFolder(
              projectId,
              state.currentPath,
              name,
              {
                id: user.uid,
                name: user.displayName || 'Unknown User',
                avatar: userPhotoURL
              }
            );
            toast.success('Folder created successfully');
            loadContent();
          } catch (error) {
            console.error('Error creating folder:', error);
            toast.error('Failed to create folder');
          } finally {
            setState(prev => ({ ...prev, isLoading: false }));
            setShowCreateFolderModal(false);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />

          <Card className="relative w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <FiTrash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Delete {itemToDelete?.type === 'file' ? 'File' : 'Folder'}
                  </Dialog.Title>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900">{itemToDelete?.name}</span>?
                {itemToDelete?.type === 'folder' && (
                  <span className="block mt-1 text-red-600">
                    This will also delete all files and folders inside it.
                  </span>
                )}
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Dialog>
    </div>
  );
} 