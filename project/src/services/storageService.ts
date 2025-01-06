import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PROJECT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadProfileImage(file: File): Promise<string> {
  // Validasi ukuran file
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    throw new Error(`Ukuran file terlalu besar. Maksimum ${MAX_PROFILE_IMAGE_SIZE / (1024 * 1024)}MB`);
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error('Hanya file gambar yang diperbolehkan (jpg, png, gif)');
  }

  const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif'];
  if (!acceptedFormats.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan format JPG, PNG, atau GIF');
  }

  try {
    const filename = `profile_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `users/profile-images/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Gagal mengupload foto profil. Silakan coba lagi.');
  }
}

export async function uploadProjectImage(file: File): Promise<string> {
  // Validasi ukuran file
  if (file.size > MAX_PROJECT_IMAGE_SIZE) {
    throw new Error(`Ukuran file terlalu besar. Maksimum ${MAX_PROJECT_IMAGE_SIZE / (1024 * 1024)}MB`);
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error('Hanya file gambar yang diperbolehkan (jpg, png, gif)');
  }

  const acceptedFormats = ['image/jpeg', 'image/png', 'image/gif'];
  if (!acceptedFormats.includes(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan format JPG, PNG, atau GIF');
  }

  try {
    const filename = `project_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `projects/cover-images/${filename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw new Error('Gagal mengupload gambar proyek. Silakan coba lagi.');
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    // Jika file tidak ditemukan, kita abaikan
    if (error.code === 'storage/object-not-found') {
      console.log('Profile image already deleted or does not exist');
      return;
    }
    console.error('Error deleting profile image:', error);
    throw new Error('Gagal menghapus foto profil. Silakan coba lagi.');
  }
}

export async function deleteProjectImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    // Jika file tidak ditemukan, kita abaikan
    if (error.code === 'storage/object-not-found') {
      console.log('Project image already deleted or does not exist');
      return;
    }
    console.error('Error deleting project image:', error);
    throw new Error('Gagal menghapus gambar proyek. Silakan coba lagi.');
  }
}