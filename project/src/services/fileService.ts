import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import type { FileItem, Folder } from '../types/file';

// Folder Management
export async function createFolder(projectId: string, path: string, name: string, user: { id: string; name: string; avatar?: string }): Promise<Folder> {
  try {
    const folderData = {
      projectId,
      name,
      path,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: user.id,
        name: user.name,
        ...(user.avatar ? { avatar: user.avatar } : {})
      },
      isSystemFolder: false
    };

    // Create folder document with custom ID based on path
    const folderId = `${projectId}_${path.replace(/\//g, '_')}_${name}`;
    await setDoc(doc(db, `folders/${projectId}/items`, folderId), folderData);
    
    return { id: folderId, ...folderData };
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

export async function getFolders(projectId: string, path: string = '/'): Promise<Folder[]> {
  try {
    const q = query(
      collection(db, `folders/${projectId}/items`),
      where('path', '==', path),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Folder[];
  } catch (error) {
    console.error('Error getting folders:', error);
    throw error;
  }
}

export async function deleteFolder(projectId: string, folderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, `folders/${projectId}/items`, folderId));
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
}

// File Management
export async function uploadFile(
  file: File, 
  projectId: string, 
  path: string = '/', 
  onProgress?: (progress: number) => void,
  user?: {
    uid: string;
    displayName: string;
    photoURL?: string;
  }
): Promise<FileItem> {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `projects/${projectId}/files/${filename}`);
    
    if (onProgress) {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          throw error;
        }
      );

      await uploadTask;
    } else {
      await uploadBytes(storageRef, file);
    }

    const url = await getDownloadURL(storageRef);

    const createdBy = {
      id: user?.uid || 'anonymous',
      name: user?.displayName || 'Anonymous',
      ...(user?.photoURL ? { avatar: user.photoURL } : {})
    };

    const fileData: Omit<FileItem, 'id'> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      path,
      createdAt: Timestamp.now().toDate().toISOString(),
      createdBy,
      source: 'manual',
      projectId
    };

    // Create file document with custom ID
    const fileId = `${projectId}_${path.replace(/\//g, '_')}_${filename}`;
    await setDoc(doc(db, `files/${projectId}/items`, fileId), fileData);
    
    return { id: fileId, ...fileData };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getFiles(projectId: string, path: string = '/'): Promise<FileItem[]> {
  try {
    // Normalize path to remove multiple slashes
    const normalizedPath = '/' + path.split('/').filter(Boolean).join('/');
    console.log('Getting files for project:', projectId, 'path:', normalizedPath);
    
    let q;
    
    // If we're in the root folder, get files with root path and manual source
    if (normalizedPath === '/') {
      console.log('Querying root folder files');
      q = query(
        collection(db, `files/${projectId}/items`),
        where('path', '==', '/'),
        orderBy('createdAt', 'desc')
      );
    } 
    // If we're in discussions folder
    else if (normalizedPath === '/discussions') {
      console.log('Querying discussion files');
      q = query(
        collection(db, `files/${projectId}/items`),
        where('source', '==', 'discussion'),
        orderBy('createdAt', 'desc')
      );
    }
    // If we're in chats folder
    else if (normalizedPath === '/chats') {
      console.log('Querying chat files');
      q = query(
        collection(db, `files/${projectId}/items`),
        where('source', '==', 'chat'),
        orderBy('createdAt', 'desc')
      );
    }
    // For other folders
    else {
      console.log('Querying other folder files');
      q = query(
        collection(db, `files/${projectId}/items`),
        where('path', '==', normalizedPath),
        orderBy('createdAt', 'desc')
      );
    }

    console.log('Executing query with path:', normalizedPath);
    const snapshot = await getDocs(q);
    console.log('Query result:', snapshot.docs.length, 'files found');
    
    const files = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('File data:', data);
      return {
        id: doc.id,
        ...data
      };
    }) as FileItem[];
    
    console.log('Processed files:', files);
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}

export async function deleteFile(projectId: string, fileId: string, url: string): Promise<void> {
  try {
    // Delete from storage
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);

    // Delete from database
    await deleteDoc(doc(db, `files/${projectId}/items`, fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Integration with Discussion and Chat
export async function addFileFromDiscussion(
  file: {
    name: string;
    url: string;
    type: string;
    size: number;
  },
  projectId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<FileItem> {
  try {
    console.log('Adding file from discussion:', { file, projectId, userId });
    
    const createdBy = {
      id: userId,
      name: userName,
      ...(userAvatar ? { avatar: userAvatar } : {})
    };

    // Ensure the discussions folder exists first
    const folders = await getFolders(projectId, '/');
    const discussionsFolder = folders.find(f => f.name === 'discussions');
    if (!discussionsFolder) {
      console.log('Creating discussions folder...');
      await createFolder(projectId, '/', 'discussions', { id: userId, name: userName, avatar: userAvatar });
    }

    // Save file with the correct path and source
    const fileData: Omit<FileItem, 'id'> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      path: '/discussions',
      createdAt: new Date().toISOString(),
      createdBy,
      source: 'discussion',
      projectId
    };

    console.log('Saving file data:', fileData);

    // Create file document with custom ID
    const fileId = `${projectId}_discussions_${Date.now()}_${file.name}`;
    await setDoc(doc(db, `files/${projectId}/items`, fileId), fileData);
    
    const savedFile = { id: fileId, ...fileData };
    console.log('File saved successfully:', savedFile);
    
    return savedFile;
  } catch (error) {
    console.error('Error adding file from discussion:', error);
    throw error;
  }
}

export async function addFileFromChat(
  file: {
    name: string;
    url: string;
    type: string;
    size: number;
  },
  projectId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<FileItem> {
  try {
    console.log('Adding file from chat:', { file, projectId, userId });
    
    const createdBy = {
      id: userId,
      name: userName,
      ...(userAvatar ? { avatar: userAvatar } : {})
    };

    // Ensure the chats folder exists first
    const folders = await getFolders(projectId, '/');
    const chatsFolder = folders.find(f => f.name === 'chats');
    if (!chatsFolder) {
      console.log('Creating chats folder...');
      await createFolder(projectId, '/', 'chats', { id: userId, name: userName, avatar: userAvatar });
    }

    // Save file with the correct path and source
    const fileData: Omit<FileItem, 'id'> = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
      path: '/chats',
      createdAt: new Date().toISOString(),
      createdBy,
      source: 'chat',
      projectId
    };

    console.log('Saving file data:', fileData);

    // Create file document with custom ID
    const fileId = `${projectId}_chats_${Date.now()}_${file.name}`;
    await setDoc(doc(db, `files/${projectId}/items`, fileId), fileData);
    
    const savedFile = { id: fileId, ...fileData };
    console.log('File saved successfully:', savedFile);
    
    return savedFile;
  } catch (error) {
    console.error('Error adding file from chat:', error);
    throw error;
  }
}

// Path Management
export function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

export function joinPaths(...paths: string[]): string {
  return '/' + paths.filter(Boolean).join('/');
}

export function isValidPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  if (path.includes('..')) return false;
  return true;
}

// System Folders
export async function createSystemFolders(projectId: string, userId: string, userName: string, userAvatar?: string) {
  const systemFolders = [
    { name: 'discussions', path: '/' },
    { name: 'chats', path: '/' },
    { name: 'documents', path: '/' },
    { name: 'assets', path: '/' }
  ];

  try {
    const createdBy = {
      id: userId,
      name: userName,
      ...(userAvatar ? { avatar: userAvatar } : {})
    };

    // Check existing folders first
    const existingFolders = await getFolders(projectId, '/');
    const foldersToCreate = systemFolders.filter(
      folder => !existingFolders.some(ef => ef.name === folder.name)
    );

    if (foldersToCreate.length > 0) {
      await Promise.all(
        foldersToCreate.map(folder =>
          createFolder(projectId, folder.path, folder.name, createdBy)
        )
      );
    }
  } catch (error) {
    console.error('Error creating system folders:', error);
    throw error;
  }
}

// File Movement
export async function moveFile(projectId: string, fileId: string, newPath: string): Promise<void> {
  try {
    console.log('Moving file:', { fileId, newPath });
    const fileRef = doc(db, `files/${projectId}/items`, fileId);
    await updateDoc(fileRef, {
      path: newPath
    });
    console.log('File moved successfully');
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
}

export async function moveFolder(projectId: string, folderId: string, newPath: string): Promise<void> {
  try {
    console.log('Moving folder:', { folderId, newPath });
    
    // Update folder path
    const folderRef = doc(db, `folders/${projectId}/items`, folderId);
    const folderDoc = await getDocs(query(collection(db, `folders/${projectId}/items`), where('id', '==', folderId)));
    const folderData = folderDoc.docs[0].data();
    const oldPath = folderData.path + '/' + folderData.name;
    const newFullPath = newPath + '/' + folderData.name;
    
    await updateDoc(folderRef, {
      path: newPath
    });

    // Update paths of all files in the folder
    const filesQuery = query(
      collection(db, `files/${projectId}/items`),
      where('path', '==', oldPath)
    );
    const filesSnapshot = await getDocs(filesQuery);
    
    const fileUpdates = filesSnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        path: newFullPath
      })
    );
    
    await Promise.all(fileUpdates);
    
    // Update paths of all subfolders
    const subfoldersQuery = query(
      collection(db, `folders/${projectId}/items`),
      where('path', '==', oldPath)
    );
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    
    const subfolderUpdates = subfoldersSnapshot.docs.map(doc =>
      updateDoc(doc.ref, {
        path: newFullPath
      })
    );
    
    await Promise.all(subfolderUpdates);
    
    console.log('Folder and contents moved successfully');
  } catch (error) {
    console.error('Error moving folder:', error);
    throw error;
  }
} 

// Storage Calculation
export async function calculateTotalStorage(projectId: string): Promise<number> {
  try {
    console.log('Calculating total storage for project:', projectId);
    
    const q = query(
      collection(db, `files/${projectId}/items`),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const totalSize = snapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      return acc + (data.size || 0);
    }, 0);

    console.log('Total storage calculated:', totalSize, 'bytes');
    return totalSize;
  } catch (error) {
    console.error('Error calculating total storage:', error);
    throw error;
  }
} 